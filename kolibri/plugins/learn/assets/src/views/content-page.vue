<template>

  <div>

    <page-header :title="content.title" dir="auto" />
    <coach-content-label
      class="coach-content-label"
      :value="content.coach_content ? 1 : 0"
      :isTopic="isTopic"
    />

    <content-renderer
      v-if="!content.assessment"
      class="content-renderer"
      @sessionInitialized="setWasIncomplete"
      @startTracking="startTracking"
      @stopTracking="stopTracking"
      @updateProgress="updateProgress"
      :id="content.id"
      :kind="content.kind"
      :files="content.files"
      :contentId="content.content_id"
      :channelId="channelId"
      :available="content.available"
      :extraFields="content.extra_fields"
      :initSession="initSession"
    />

    <assessment-wrapper
      v-else
      class="content-renderer"
      @sessionInitialized="setWasIncomplete"
      @startTracking="startTracking"
      @stopTracking="stopTracking"
      @updateProgress="updateProgress"
      :id="content.id"
      :kind="content.kind"
      :files="content.files"
      :contentId="content.content_id"
      :channelId="channelId"
      :available="content.available"
      :extraFields="content.extra_fields"
      :initSession="initSession"
    />

    <!-- TODO consolidate this metadata table with coach/lessons -->
    <p v-html="description" dir="auto"></p>


    <section class="metadata">
      <!-- TODO: RTL - Do not interpolate strings -->
      <p v-if="content.author">
        {{ $tr('author', {author: content.author}) }}
      </p>

      <p v-if="content.license_name">
        {{ $tr('license', {license: content.license_name}) }}

        <template v-if="content.license_description">
          <ui-icon-button
            :ariaLabel="$tr('toggleLicenseDescription')"
            size="small"
            type="secondary"
            @click="licenceDescriptionIsVisible = !licenceDescriptionIsVisible"
          >
            <mat-svg v-if="licenceDescriptionIsVisible" name="expand_less" category="navigation" />
            <mat-svg v-else name="expand_more" category="navigation" />
          </ui-icon-button>
          <p v-if="licenceDescriptionIsVisible" dir="auto">
            {{ content.license_description }}
          </p>
        </template>
      </p>

      <p v-if="content.license_owner">
        {{ $tr('copyrightHolder', {copyrightHolder: content.license_owner}) }}
      </p>
    </section>

    <download-button
      v-if="canDownload"
      :files="downloadableFiles"
      class="download-button"
    />

    <slot name="below_content">
      <template v-if="progress >= 1 && content.next_content">
        <h2>{{ $tr('nextResource') }}</h2>
        <content-card-group-carousel
          :genContentLink="genContentLink"
          :contents="[content.next_content]"
        />
      </template>
      <template v-if="showRecommended">
        <h2>{{ $tr('recommended') }}</h2>
        <content-card-group-carousel
          :genContentLink="genContentLink"
          :header="recommendedText"
          :contents="recommended"
        />
      </template>
    </slot>

    <mastered-snackbars
      v-if="progress >= 1 && wasIncomplete"
      :nextContent="content.next_content"
      :nextContentLink="nextContentLink"
      @close="markAsComplete"
    />

  </div>

</template>


<script>

  import { mapState, mapGetters, mapActions } from 'vuex';
  import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';
  import contentRenderer from 'kolibri.coreVue.components.contentRenderer';
  import coachContentLabel from 'kolibri.coreVue.components.coachContentLabel';
  import downloadButton from 'kolibri.coreVue.components.downloadButton';
  import { isAndroidWebView } from 'kolibri.utils.browser';
  import uiIconButton from 'keen-ui/src/UiIconButton';
  import markdownIt from 'markdown-it';
  import { PageNames, PageModes, ClassesPageNames } from '../constants';
  import { updateContentNodeProgress } from '../state/actions/main';
  import pageHeader from './page-header';
  import contentCardGroupCarousel from './content-card-group-carousel';
  import assessmentWrapper from './assessment-wrapper';
  import masteredSnackbars from './mastered-snackbars';
  import { lessonResourceViewerLink } from './classes/classPageLinks';

  export default {
    name: 'contentPage',
    $trs: {
      recommended: 'Recommended',
      author: 'Author: {author}',
      license: 'License: {license}',
      toggleLicenseDescription: 'Toggle license description',
      copyrightHolder: 'Copyright holder: {copyrightHolder}',
      nextResource: 'Next resource',
      documentTitle: '{ contentTitle } - { channelTitle }',
    },
    components: {
      coachContentLabel,
      pageHeader,
      contentCardGroupCarousel,
      contentRenderer,
      downloadButton,
      assessmentWrapper,
      masteredSnackbars,
      uiIconButton,
    },
    metaInfo() {
      // Do not overwrite metaInfo of LessonResourceViewer
      if (this.pageName === ClassesPageNames.LESSON_RESOURCE_VIEWER) {
        return {};
      }
      return {
        title: this.$tr('documentTitle', {
          contentTitle: this.content.title,
          channelTitle: this.channel.title,
        }),
      };
    },
    data: () => ({
      wasIncomplete: false,
      licenceDescriptionIsVisible: false,
    }),
    computed: {
      ...mapGetters(['isUserLoggedIn', 'facilityConfig', 'contentPoints', 'pageMode']),
      ...mapState(['pageName']),
      ...mapState({
        content: state => state.pageState.content,
        channel: state => state.pageState.channel,
        contentId: state => state.pageState.content.content_id,
        contentNodeId: state => state.pageState.content.id,
        channelId: state => state.pageState.content.channel_id,
        recommended: state => state.pageState.recommended,
        summaryProgress: state => state.core.logging.summary.progress,
        sessionProgress: state => state.core.logging.session.progress,
      }),
      isTopic() {
        return this.content.kind === ContentNodeKinds.TOPIC;
      },
      canDownload() {
        if (this.facilityConfig.showDownloadButtonInLearn && this.content) {
          return (
            this.downloadableFiles.length &&
            this.content.kind !== ContentNodeKinds.EXERCISE &&
            !isAndroidWebView()
          );
        }
        return false;
      },
      description() {
        if (this.content) {
          const md = new markdownIt('zero', { breaks: true });
          return md.render(this.content.description);
        }
      },
      recommendedText() {
        return this.$tr('recommended');
      },
      progress() {
        if (this.isUserLoggedIn) {
          return this.summaryProgress;
        }
        return this.sessionProgress;
      },
      showRecommended() {
        return (
          this.recommended && this.recommended.length && this.pageMode === PageModes.RECOMMENDED
        );
      },
      downloadableFiles() {
        return this.content.files.filter(file => file.preset !== 'Thumbnail');
      },
      nextContentLink() {
        // HACK Use a the Resource Viewer Link instead
        if (this.pageName === ClassesPageNames.LESSON_RESOURCE_VIEWER) {
          return lessonResourceViewerLink(Number(this.$route.params.resourceNumber) + 1);
        }
        return {
          name:
            this.content.next_content.kind === ContentNodeKinds.TOPIC
              ? PageNames.TOPICS_TOPIC
              : PageNames.RECOMMENDED_CONTENT,
          params: { id: this.content.next_content.id },
        };
      },
    },
    beforeDestroy() {
      this.stopTracking();
    },
    methods: {
      ...mapActions({
        initSessionAction: 'initContentSession',
        updateProgressAction: 'updateProgress',
        startTracking: 'startTrackingProgress',
        stopTracking: 'stopTrackingProgress',
      }),
      setWasIncomplete() {
        this.wasIncomplete = this.progress < 1;
      },
      initSession() {
        return this.initSessionAction({
          channelId: this.channelId,
          contentId: this.contentId,
          contentKind: this.content.kind,
        });
      },
      updateProgress(progressPercent, forceSave = false) {
        const summaryProgress = this.updateProgressAction({ progressPercent, forceSave });
        updateContentNodeProgress(this.channelId, this.contentNodeId, summaryProgress);
      },
      markAsComplete() {
        this.wasIncomplete = false;
      },
      genContentLink(id, kind) {
        return {
          name:
            kind === ContentNodeKinds.TOPIC
              ? PageNames.TOPICS_TOPIC
              : PageNames.RECOMMENDED_CONTENT,
          params: { id },
        };
      },
    },
  };

</script>


<style lang="scss" scoped>

  .coach-content-label {
    margin: 8px 0;
  }

  .content-renderer {
    margin-top: 24px;
  }

  .float {
    float: right;
  }

  .metadata {
    font-size: smaller;
  }

  .download-button {
    display: block;
  }

</style>
