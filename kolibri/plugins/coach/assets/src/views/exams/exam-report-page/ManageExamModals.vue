<template>

  <div>
    <preview-exam-modal
      v-if="examsModalSet === ExamModals.PREVIEW_EXAM"
      :examQuestionSources="exam.question_sources"
      :examSeed="exam.seed"
      :examNumQuestions="exam.question_count"
    />

    <assignment-change-status-modal
      v-else-if="examsModalSet === AssignmentActions.CHANGE_STATUS"
      :modalTitle="$tr('changeExamStatusTitle')"
      :modalDescription="$tr('changeExamStatusDescription')"
      :active="exam.active"
      @changeStatus="handleChangeStatus"
      @cancel="setExamsModal(null)"
    />

    <assignment-details-modal
      v-else-if="examsModalSet === AssignmentActions.EDIT_DETAILS"
      :modalTitle="$tr('editExamDetails')"
      :submitErrorMessage="$tr('saveExamError')"
      :showDescriptionField="false"
      :isInEditMode="true"
      :initialTitle="exam.title"
      :initialSelectedCollectionIds="selectedCollectionIds"
      :classId="classId"
      :groups="learnerGroups"
      @save="handleUpdateExamDetails"
      @cancel="setExamsModal(null)"
      ref="detailsModal"
    />

    <assignment-copy-modal
      v-else-if="examsModalSet === AssignmentActions.COPY"
      :modalTitle="$tr('copyExamTitle')"
      :copyExplanation="$tr('copyExplanation')"
      :assignmentQuestion="$tr('assignmentQuestion')"
      :classId="classId"
      :classList="classList"
      @copy="handleCopyExam"
      @cancel="setExamsModal(null)"
    />

    <assignment-delete-modal
      v-else-if="examsModalSet === AssignmentActions.DELETE"
      :modalTitle="$tr('deleteExamTitle')"
      :modalDescription="$tr('deleteExamDescription', { title: exam.title })"
      @delete="deleteExam(exam.id)"
      @cancel="setExamsModal(null)"
    />
  </div>

</template>


<script>

  import { mapState, mapActions } from 'vuex';
  import xorWith from 'lodash/xorWith';
  import AssignmentChangeStatusModal from '../../assignments/AssignmentChangeStatusModal';
  import previewExamModal from '../exams-page/preview-exam-modal';
  import AssignmentDetailsModal from '../../assignments/AssignmentDetailsModal';
  import AssignmentCopyModal from '../../assignments/AssignmentCopyModal';
  import AssignmentDeleteModal from '../../assignments/AssignmentDeleteModal';
  import { Modals as ExamModals } from '../../../constants/examConstants';
  import { AssignmentActions } from '../../../constants/assignmentsConstants';

  export default {
    name: 'manageExamModals',
    components: {
      AssignmentChangeStatusModal,
      previewExamModal,
      AssignmentDetailsModal,
      AssignmentCopyModal,
      AssignmentDeleteModal,
    },
    computed: {
      ...mapState(['classId', 'className', 'classList']),
      ...mapState({
        exam: state => state.pageState.exam,
        examsModalSet: state => state.pageState.examsModalSet,
        learnerGroups: state => state.pageState.learnerGroups,
      }),
      AssignmentActions() {
        return AssignmentActions;
      },
      ExamModals() {
        return ExamModals;
      },
      selectedCollectionIds() {
        return this.exam.assignments.map(assignment => assignment.collection);
      },
    },
    methods: {
      ...mapActions([
        'setExamsModal',
        'activateExam',
        'deactivateExam',
        'deleteExam',
        'copyExam',
        'updateExamDetails',
      ]),
      handleChangeStatus(isActive) {
        if (isActive === true) {
          this.activateExam(this.exam.id);
        } else if (isActive === false) {
          this.deactivateExam(this.exam.id);
        }
      },
      handleUpdateExamDetails(details) {
        const payload = {};
        const origAssignments = this.exam.assignments.map(assignment => ({
          collection: assignment.collection,
        }));

        if (
          xorWith(details.assignments, origAssignments, (a, b) => a.collection === b.collection)
            .length > 0
        ) {
          payload.assignments = details.assignments;
        }
        if (details.title !== this.exam.title) {
          payload.title = details.title;
        }
        if (payload === {}) {
          this.setExamsModal(null);
          return;
        }
        this.updateExamDetails({ examId: this.exam.id, payload })
          .then()
          .catch(() => this.$refs.detailsModal.handleSubmitFailure());
      },
      handleCopyExam(selectedClassroomId, selectedCollectionIds) {
        let title = this.$tr('copyOfExam', { examTitle: this.exam.title })
          .substring(0, 50)
          .trim();
        const exam = {
          collection: selectedClassroomId,
          channel_id: this.exam.channel_id,
          title,
          question_count: this.exam.question_count,
          question_sources: this.exam.question_sources,
          seed: this.exam.seed,
          assignments: selectedCollectionIds.map(id => ({ collection: id })),
        };
        this.copyExam({ exam, className: this.className });
      },
    },
    $trs: {
      changeExamStatusTitle: 'Change exam status',
      changeExamStatusDescription: 'Learners can only see active exams',
      copyExamTitle: 'Copy exam',
      copyExplanation: 'Copy this exam to',
      assignmentQuestion: 'Assign exam to',
      deleteExamTitle: 'Delete exam',
      deleteExamDescription: "Delete '{ title }'?",
      editExamDetails: 'Edit exam details',
      saveExamError: 'There was a problem saving this exam',
      copyOfExam: 'Copy of { examTitle }',
    },
  };

</script>


<style lang="scss" scoped></style>
