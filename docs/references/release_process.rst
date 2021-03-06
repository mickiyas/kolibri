.. _release_process:

Release process
===============

These instructions follow the hypothetical release of Kolibri version 0.3.0.

In this case, the repo would currently have a ``develop`` branch and a number of pre-existing release branches, the most recent being ``release-v0.2.x`` with potententially multiple tags for patch releases, e.g. ``v0.2.0`` and ``v0.2.1``.

Create alpha releases
---------------------

For the majority of development on a new release, PRs will target the ``develop`` branch. Tag alpha releases as desired using Github's `Releases <https://github.com/learningequality/kolibri/releases>`_ functionality, which both adds a tag to the git repo and creates a placeholder on the Github site with built distributions.

Make sure to target ``develop``, use the standard tag naming convention (e.g. ``v0.3.0-alpha1``), and mark it has a "pre-release".

These alphas can be used for preliminary testing as major, unstable updates are introduced.

When a new alpha is published, delete any older alphas using Github's 'delete release' functionality. This will *not* delete the git tag.


Merge in previous release
-------------------------

It's common that changes have been made in the previous release that need to be propagated to the current release. For an upcoming 0.3.0 release, we would need to merge ``release-v0.2.x`` into ``develop``.


Schedule string freeze
----------------------

Once we are close to stabilizing the UI, we should schedule a string freeze.

* Create a temporary branch and merge any outstanding PRs with user-facing strings into it
* Upload the strings to Crowdin, into a temporary branch called ``test-upload``
* Estimate the number of new strings and words, and the approximate time when translators should be prepared to start translating
* Notify translators
* Delete the temporary branches


Create a release branch
-----------------------

When we're nearing the end of major new feature development, cut a new release branch. If we're getting ready to release version 0.3.0, we'd do the following steps:

* Create new branch off of ``develop`` with a name like ``release-v0.3.x``
* Set up `branch protections <https://help.github.com/articles/about-protected-branches/>`_ in Github using the same settings as ``develop``
* Re-target any outstanding PRs for this release from ``develop`` to ``release-v0.3.x``

Next, a couple book-keeping steps are necessary. The ``VERSION`` variable in *__init__.py* should currently be ``(0, 2, 0, 'alpha', 1)`` in both the  ``release-v0.3.x`` and ``develop`` branches.

* In ``develop``, update the first three values from ``0, 2, 0`` to ``0, 3, 0``
* In ``release-v0.3.x``, bump fourth value: ``'alpha'`` to  ``'beta'``

These changes can be merged by a Github admin without code review.

Finally, tag the first beta using Github's `Releases <https://github.com/learningequality/kolibri/releases>`_ functionality. Target the ``release-v0.3.x`` branch, use the standard tag naming convention (``v0.3.0-beta1``), and mark it has a "pre-release".


Pin internal dependencies
-------------------------

Make sure all our internal dependencies are pointing at the correct, published versions. Specifically check:

* Morango
* LE Utils
* Perseus plugin
* Windows installer

Test to ensure that changes have propagated as expected.


Final string review and freeze
------------------------------

The team should make a final review of all user-facing strings introduced into the application in this release.

When the user-facing strings have been signed off, upload the strings to Crowdin and notify translators that translation can begin.

Remember to also include strings from the Perseus plugin if necessary.

At this point, updates to the `user documentation <https://github.com/learningequality/kolibri-docs/>`_ can also begin.


Integration testing and beta releases
-------------------------------------

Thoroughly test user stories, browsers, and operating systems. Publish beta Debian packages to `` kolibri-proposed``, update gherkin story test matrices, test performance, have bug bashes...

As fixes are made, release a new beta at least every few days.

Make sure to target tags to the release branch. For example, for 0.3.0 betas, target ``release-v0.3.x``. Use the standard tag naming convention (e.g. ``v0.3.0-beta1``), and mark it has a "pre-release" in the Github UI.

These betas should be used for end-to-end testing as final, stabilizing changes are introduced. Risky changes should be avoided during the beta stage unless a critical issue is identified with no straightforward fix.

When a new beta is published, delete any older betas using Github's 'delete release' functionality. This will *not* delete the git tag. Update `kolibribeta.learningequality.org <http://kolibribeta.learningequality.org/>`_ with the latest beta, and notify the team on Slack when new betas are available.


Update with final translations
------------------------------

* Determine which languages are ready for inclusion
* Download all strings for supported languages in Kolibri and Perseus
* Re-publish Perseus if necessary, and update the Kolibri dependency reference
* Test that all languages render properly


Merge in previous release again
-------------------------------

Check one last time if there were any last-minute changes to the previous release branch that need to be merged into the current release branch. For example in preparation for 0.3.0, we would need to merge ``release-v0.2.x`` into ``release-v0.3.x``.


Triage open PRs and issues
--------------------------

Check the current Github milestone for any outstanding PRs or issues. If there are any that cannot be closed or merged before release, either clear the milestone or re-target them to the next milestone.

This could either be a patch of the current release or the next 'major' release.


Update the Changelog
--------------------

Update the :ref:`changelog` as necessary. In general we should try to keep the changelog up-to-date as PRs are merged in; however in practice the changelog usually needs to be cleaned up, fleshed out, and clarified.

Our changelogs should list:

* significant new features that were added
* significant categories of bug fixes or user-facing improvements
* significant behind-the-scenes technical improvements

Keep entries concise and consistent with the established writing style. The changelog should not include an entry for every PR or every issue closed. Reading the changelog should give a quick, high-level, semi-technical summary of what has changed.

Note that for older patch releases, the change should only be mentioned once: it is implied that fixes in older releases are propagated forward.

Additionally, we should also be adding the 'changelog' label to issues and pull requests on Github. A more technical and granular overview of changes can be obtained by filtering by milestone and the 'changelog' label. Go through these issues and PRs, and ensure that the titles would be clear and meaningful.

Ensure the link to Github changelog label+milestone is correct.


Prepare blog post
-----------------

Draft a blog post on Medium containing highlights of the release. This can be kept hidden until it's time to update the website as outlined below.


Create the final release
------------------------

Before proceeding, tag and build one last beta, and run through the most critical user stories to ensure that there are no glaring issues. If that checks out, it's time to create the final release.

For example, if we were releasing version 0.3.0, we would perform these steps:

* The ``VERSION`` variable in *__init__.py* should currently be ``(0, 3, 0, 'beta', 1)`` in ``release-v0.3.x``
* Update this to be ``(0, 3, 0, 'final', 0)`` (no code review necessary)
* Tag the final release as ``v0.3.0`` targetting the ``release-v0.3.x`` branch using Github's `Releases <https://github.com/learningequality/kolibri/releases>`_ functionality.
* Copy the entries from the changelog into Github's "Release notes" and ensure that the formatting and links are correct.
* Delete the most recent beta pre-lease on github.
* Merge ``release-v0.3.x`` into ``master`` (no code review necessary)
* Update ``VERSION`` in ``release-v0.3.x`` to be ``(0, 3, 1, 'beta', 0)`` (no code review necessary)

At this point, all changes to the git tree are complete for the release.

Publish to PyPI
---------------

Releasing to PyPI marks the "no turning back" moment of a release because releases cannot be removed – only added. Make sure that the correct tag is checked out and that the git tree has no local changes.

If this were version 0.3.0 we would do:

.. code-block:: bash

    $ git reset --hard v0.3.0

Then sign the release and upload it:

.. code-block:: bash

    $ make release

Confirm that the release is uploaded to `PyPi <https://pypi.org/>`_, and try installing it and running it on a few operating systems with both Python 2 and Python 3.


Generate, test, and publish distributions
----------------------------------

When uploading files to the Pantry server, put them in a directory of the form ``/var/www/downloads/kolibri/vX.Y.Z/``.

Make sure the files and parent directories are owned by the ``www-data`` user, e.g. by running ``sudo chown www-data:www-data [filename]``


For the example of version 0.3.0 we would do the following:

* Pex
   * Test that .pex works and version info is correct
   * Upload .pex to Pantry as ``kolibri-v0.3.0.pex``
* Debian
   * Build and sign Debian package
   * Test that .deb works and that version is correct
   * Publish package to our PPA
   * Upload .deb to Pantry as ``kolibri_0.3.0-0ubuntu1_all.deb``
   * Note that if another Debian build is necessary, ``ubuntu1`` can be incremented
* Windows
   * Sign Windows installer
   * Test that .exe works and that version is correct
   * Upload .exe to Pantry as ``kolibri-v0.3.0-windows-installer.exe``


Update `learningequality.org/download <https://learningequality.org/download/>`_ to point to the latest release by updating variables in the Admin page. Log in and navigate to:

    `Admin <https://learningequality.org/admin/>`_ → Redirects → Redirect variables

Update the following variables:

* ``LATEST_KOLIBRI_VERSION``
* ``LATEST_KOLIBRI_SUPPORTED_LANGUAGES``
* ``LATEST_KOLIBRI_RELEASE_DATE``
* ``LATEST_KOLIBRI_DEBIAN_VERSION_COMPONENT``
* ``LATEST_KOLIBRI_BLOG_URL``

Publish the Medium post if necessary.

Update the demo server
----------------------

Get `kolibridemo.learningequality.org <http://kolibridemo.learningequality.org/>`_ running the latest version:

 * SSH into ``192.237.248.135``
 * ``sudo su www-data``
 * Upload the new .pex file and update ``/var/www/run_kolibri.sh`` to point at it

Then restart all running instances:

.. code-block:: bash

    killall python
    run_all


Verify that `the demo server <kolibridemo.learningequality.org>`_ is running the latest version.


Wrap-up
-------

* Publish relevant updates to the `Toolkit <https://learningequality.org/r/toolkit>`_ and `User documentation <https://kolibri.readthedocs.io/en/latest/>`_
* `Close the milestone <https://github.com/learningequality/kolibri/milestones>`_ on Github
* For issues on this milestone that have been reported by the community, try to report in appropriate forum threads that the new release addresses the issues


Patch releases
--------------

A patch release follows the same process outlined above, except that development occurs exclusively on an existing release branch.

This means that patch releases only have betas, not alphas.

