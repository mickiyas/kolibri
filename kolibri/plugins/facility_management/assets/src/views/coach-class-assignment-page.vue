<template>

  <div>
    <h1>{{ $tr('pageHeader', {className}) }}</h1>
    <p>{{ $tr('pageSubheader') }}</p>
    <class-enroll-form
      @submit="assignCoaches"
      :facilityUsers="facilityUsers"
      :classUsers="classUsers"
    />
  </div>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import { PageNames } from '../constants';
  import classEnrollForm from './class-enroll-form';

  export default {
    name: 'coachClassAssignmentPage',
    metaInfo() {
      return {
        title: this.$tr('pageHeader', { className: this.className }),
      };
    },
    components: {
      classEnrollForm,
    },
    computed: {
      ...mapState({
        className: state => state.pageState.class.name,
        facilityUsers: state => state.pageState.facilityUsers,
        classUsers: state => state.pageState.classUsers,
      }),
    },
    methods: {
      ...mapActions(['assignCoachesToClass']),
      assignCoaches(coaches) {
        this.assignCoachesToClass(coaches).then(() => {
          // do this in action?
          this.$router.push({ name: PageNames.CLASS_EDIT_MGMT_PAGE });
        });
      },
    },
    $trs: {
      pageHeader: "Assign a coach to '{className}'",
      pageSubheader: 'Showing coaches that are not assigned to this class',
    },
  };

</script>


<style lang="scss" scoped></style>
