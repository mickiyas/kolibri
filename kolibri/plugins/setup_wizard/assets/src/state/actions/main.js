import { DeviceProvisionResource } from 'kolibri.resources';

export function provisionDevice(store, onboardingData) {
  const { superuser } = onboardingData;

  store.commit('SET_LOADING', true);

  return DeviceProvisionResource.createModel(onboardingData)
    .save()
    .then(
      response => {
        superuser.facility = response.facility.id;
        store.dispatch('kolibriLogin', superuser);
      },
      error => {
        store.commit('SET_ERROR', true);
        store.dispatch('handleApiError', error);
      }
    );
}

export function goToNextStep(store) {
  store.commit('INCREMENT_ONBOARDING_STEP');
}

export function goToPreviousStep(store) {
  store.commit('DECREMENT_ONBOARDING_STEP');
}
