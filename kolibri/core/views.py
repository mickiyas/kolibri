from django import http
from django.conf import settings
from django.contrib.auth import logout
from django.core.urlresolvers import translate_url
from django.http import Http404
from django.http import HttpResponseRedirect
from django.utils.http import is_safe_url
from django.utils.translation import check_for_language
from django.utils.translation import LANGUAGE_SESSION_KEY
from django.utils.translation import ugettext_lazy as _
from django.views.generic.base import View
from django.views.i18n import LANGUAGE_QUERY_PARAMETER

from kolibri.core.auth.constants import user_kinds
from kolibri.core.auth.models import Role
from kolibri.core.hooks import RoleBasedRedirectHook


# Modified from django.views.i18n
def set_language(request):
    """
    Redirect to a given url while setting the chosen language in the
    session or cookie. The url and the language code need to be
    specified in the request parameters.
    Since this view changes how the user will see the rest of the site, it must
    only be accessed as a POST request. If called as a GET request, it will
    redirect to the page in the request (the 'next' parameter) without changing
    any state.
    """
    next = request.POST.get('next', request.GET.get('next'))
    if not is_safe_url(url=next, host=request.get_host()):
        next = request.META.get('HTTP_REFERER')
        if not is_safe_url(url=next, host=request.get_host()):
            next = '/'
    response = http.HttpResponseRedirect(next)
    if request.method == 'POST':
        lang_code = request.POST.get(LANGUAGE_QUERY_PARAMETER)
        if lang_code and check_for_language(lang_code):
            next_trans = translate_url(next, lang_code)
            if next_trans != next:
                response = http.HttpResponseRedirect(next_trans)
            if hasattr(request, 'session'):
                request.session[LANGUAGE_SESSION_KEY] = lang_code
            # Always set cookie
            response.set_cookie(settings.LANGUAGE_COOKIE_NAME, lang_code,
                                max_age=settings.LANGUAGE_COOKIE_AGE,
                                path=settings.LANGUAGE_COOKIE_PATH,
                                domain=settings.LANGUAGE_COOKIE_DOMAIN)
    return response


def logout_view(request):
    logout(request)
    return http.HttpResponseRedirect('/')


def get_url_by_role(role, first_login):
    obj = next((hook for hook in RoleBasedRedirectHook().registered_hooks
                if hook.role == role and hook.first_login == first_login), None)
    if obj:
        return obj.url


class GuestRedirectView(View):
    def get(self, request):
        """
        Redirects a guest user to a learner accessible page.
        """
        return HttpResponseRedirect(get_url_by_role(user_kinds.LEARNER, False))


class RootURLRedirectView(View):

    def get(self, request):
        """
        Redirects user based on the highest role they have for which a redirect is defined.
        """
        first_login = request.session.get("first_login", False)
        if request.user.is_authenticated():
            url = None
            if request.user.is_superuser:
                url = url or get_url_by_role(user_kinds.SUPERUSER, first_login)
            roles = set(Role.objects.filter(user_id=request.user.id).values_list('kind', flat=True).distinct())
            if user_kinds.ADMIN in roles:
                url = url or get_url_by_role(user_kinds.ADMIN, first_login)
            if user_kinds.COACH in roles:
                url = url or get_url_by_role(user_kinds.COACH, first_login)
            url = url or get_url_by_role(user_kinds.LEARNER, first_login)
        else:
            url = get_url_by_role(user_kinds.ANONYMOUS, first_login)
        if url:
            return HttpResponseRedirect(url)
        raise Http404(_("No appropriate redirect pages found, it is likely that Kolibri is badly configured"))
