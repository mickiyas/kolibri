<template>

  <k-modal
    :title="$tr('resetPassword')"
    :submitText="$tr('save')"
    :cancelText="$tr('cancel')"
    :submitDisabled="isBusy"
    @submit="submitForm"
    @cancel="displayModal(false)"
  >
    <p>{{ $tr('username') }}<strong>{{ username }}</strong></p>

    <k-textbox
      ref="password"
      type="password"
      :label="$tr('newPassword')"
      :autofocus="true"
      :invalid="passwordIsInvalid"
      :invalidText="passwordIsInvalidText"
      @blur="passwordBlurred = true"
      v-model="password"
    />
    <k-textbox
      ref="confirmedPassword"
      type="password"
      :label="$tr('confirmNewPassword')"
      :invalid="confirmedPasswordIsInvalid"
      :invalidText="confirmedPasswordIsInvalidText"
      @blur="confirmedPasswordBlurred = true"
      v-model="confirmedPassword"
    />
  </k-modal>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import kTextbox from 'kolibri.coreVue.components.kTextbox';
  import kModal from 'kolibri.coreVue.components.kModal';

  export default {
    name: 'resetUserPasswordModal',
    components: {
      kModal,
      kTextbox,
    },
    props: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        password: '',
        confirmedPassword: '',
        passwordBlurred: false,
        confirmedPasswordBlurred: false,
        submittedForm: false,
      };
    },
    computed: {
      ...mapState({
        isBusy: state => state.pageState.isBusy,
      }),
      passwordIsInvalidText() {
        if (this.passwordBlurred || this.submittedForm) {
          if (this.password === '') {
            return this.$tr('required');
          }
        }
        return '';
      },
      passwordIsInvalid() {
        return Boolean(this.passwordIsInvalidText);
      },
      confirmedPasswordIsInvalidText() {
        if (this.confirmedPasswordBlurred || this.submittedForm) {
          if (this.confirmedPassword === '') {
            return this.$tr('required');
          }
          if (this.confirmedPassword !== this.password) {
            return this.$tr('passwordMatchError');
          }
        }
        return '';
      },
      confirmedPasswordIsInvalid() {
        return Boolean(this.confirmedPasswordIsInvalidText);
      },
      formIsValid() {
        return !this.passwordIsInvalid && !this.confirmedPasswordIsInvalid;
      },
    },
    methods: {
      ...mapActions(['updateFacilityUser', 'displayModal', 'handleApiError']),
      submitForm() {
        this.submittedForm = true;
        if (this.formIsValid) {
          // TODO handle the error within this modal (needs new strings)
          this.updateFacilityUser({ userId: this.id, updates: { password: this.password } })
            .catch(error => this.handleApiError(error))
            .then(() => this.displayModal(false));
        } else {
          if (this.passwordIsInvalid) {
            this.$refs.password.focus();
          } else if (this.confirmedPasswordIsInvalid) {
            this.$refs.confirmedPassword.focus();
          }
        }
      },
    },
    $trs: {
      resetPassword: 'Reset user password',
      username: 'Username: ',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      passwordMatchError: 'Passwords do not match',
      required: 'This field is required',
      cancel: 'cancel',
      save: 'Save',
    },
  };

</script>


<style lang="scss" scoped></style>
