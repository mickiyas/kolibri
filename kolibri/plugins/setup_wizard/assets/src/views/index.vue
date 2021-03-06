<template>

  <div class="onboarding">

    <error-page
      v-if="error"
      :class="['onboarding-body', (isMobile ? 'mobile' : '')]"
    />

    <loading-page
      v-else-if="loading"
      :class="['onboarding-body', (isMobile ? 'mobile' : '')]"
    />

    <template v-else>
      <progress-toolbar
        @backButtonClicked="goToPreviousStep"
        :currentStep="onboardingStep"
        :totalSteps="totalOnboardingSteps"
      />

      <component
        :is="currentOnboardingForm"
        :submitText="submitText"
        :isMobile="isMobile"
        @submit="continueOnboarding"
        :class="['onboarding-body', (isMobile ? 'mobile' : '')]"
      />
    </template>

  </div>

</template>


<script>

  import { mapActions, mapState } from 'vuex';
  import responsiveWindow from 'kolibri.coreVue.mixins.responsiveWindow';
  import loadingPage from './submission-states/loading-page';
  import errorPage from './submission-states/error-page';
  import progressToolbar from './progress-toolbar';
  import defaultLanguageForm from './onboarding-forms/default-language-form';
  import facilityNameForm from './onboarding-forms/facility-name-form';
  import superuserCredentialsForm from './onboarding-forms/superuser-credentials-form';
  import facilityPermissionsForm from './onboarding-forms/facility-permissions-form';

  export default {
    name: 'onboarding',
    components: { progressToolbar, loadingPage, errorPage },
    mixins: [responsiveWindow],
    $trs: {
      onboardingNextStepButton: 'Continue',
      onboardingFinishButton: 'Finish',
      documentTitle: 'Setup Wizard',
    },
    metaInfo() {
      return {
        title: this.$tr('documentTitle'),
      };
    },
    data() {
      return {
        totalOnboardingSteps: 4,
      };
    },
    computed: {
      ...mapState(['onboardingStep', 'onboardingData', 'loading', 'error']),
      currentOnboardingForm() {
        switch (this.onboardingStep) {
          case 1:
            return defaultLanguageForm;
          case 2:
            return facilityNameForm;
          case 3:
            return facilityPermissionsForm;
          case 4:
            return superuserCredentialsForm;
          default:
            return null;
        }
      },
      isLastStep() {
        return this.onboardingStep === this.totalOnboardingSteps;
      },
      submitText() {
        return this.isLastStep
          ? this.$tr('onboardingFinishButton')
          : this.$tr('onboardingNextStepButton');
      },
      isMobile() {
        return this.windowSize.breakpoint < 4;
      },
    },
    methods: {
      ...mapActions(['goToNextStep', 'goToPreviousStep', 'provisionDevice']),
      continueOnboarding() {
        if (this.isLastStep) {
          this.provisionDevice(this.onboardingData);
        } else {
          this.goToNextStep();
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  @import '~kolibri.styles.definitions';

  .onboarding {
    @include clearfix(); // child margin leaks up into otherwise empty parent

    width: 100%;
    &-body {
      width: 90%;
      max-width: 550px;
      margin-top: 64px;
      margin-right: auto;
      margin-left: auto;
      &.mobile {
        margin: 40px auto;
      }
    }
  }

</style>
