import {
  ClassroomResource,
  MembershipResource,
  FacilityUserResource,
  RoleResource,
} from 'kolibri.resources';
import samePageCheckGenerator from 'kolibri.utils.samePageCheckGenerator';
import { UserKinds } from 'kolibri.coreVue.vuex.constants';
import ConditionalPromise from 'kolibri.lib.conditionalPromise';
import { PageNames } from '../../constants';
import { filterAndSortUsers } from '../../userSearchUtils';
import { _userState } from './helpers/mappers';
import displayModal from './helpers/displayModal';
import preparePage from './helpers/preparePage';

/**
 * Do a POST to create new class
 * @param {string} name
 */
export function createClass(store, name) {
  ClassroomResource.createModel({
    name,
    parent: store.state.core.session.facility_id,
  })
    .save()
    .then(
      classroom => {
        store.commit('ADD_CLASS', classroom);
        displayModal(store, false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

/**
 * Do a PATCH to update the class.
 * @param {string} id - class id.
 * @param {object} updateData.
 */
export function updateClass(store, { id, updateData }) {
  if (!id || Object.keys(updateData).length === 0) {
    // if no id or empty updateData passed, abort the function
    return;
  }
  ClassroomResource.getModel(id)
    .save(updateData)
    .then(
      updatedClass => {
        store.commit('UPDATE_CLASS', { id, updatedClass });
        displayModal(store, false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

/**
 * Do a DELETE to delete the class.
 * @param {string or Integer} id
 */
export function deleteClass(store, id) {
  if (!id) {
    // if no id passed, abort the function
    return;
  }
  return ClassroomResource.getModel(id)
    .delete()
    .then(
      () => {
        store.commit('DELETE_CLASS', id);
        displayModal(store, false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

export function enrollLearnersInClass(store, users) {
  const classId = store.state.pageState.class.id;
  // TODO no error handling
  return MembershipResource.createCollection(
    {
      collection: classId,
    },
    users.map(userId => ({
      collection: classId,
      user: userId,
    }))
  ).save();
}

export function assignCoachesToClass(store, coaches) {
  const classId = store.state.pageState.class.id;
  // TODO no error handling
  return RoleResource.createCollection(
    {
      collection: classId,
    },
    coaches.map(userId => ({
      collection: classId,
      user: userId,
      kind: UserKinds.COACH,
    }))
  ).save();
}

export function removeClassLearner(store, { classId, userId }) {
  if (!classId || !userId) {
    // if no id passed, abort the function
    return;
  }
  // fetch the membership model with this classId and userId.
  return MembershipResource.getCollection({
    user: userId,
    collection: classId,
  })
    .delete()
    .then(
      () => {
        store.commit('DELETE_CLASS_LEARNER', userId);
        displayModal(store, false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

export function removeClassCoach(store, { classId, userId }) {
  // TODO class id should be accessible from state.
  if (!classId || !userId) {
    // if no id passed, abort the function
    return;
  }
  // TODO use a getModel with role id? should be available. Might have to undo mappers
  // fetch the membership model with this classId and userId.
  return RoleResource.getCollection({
    user: userId,
    collection: classId,
  })
    .delete()
    .then(
      () => {
        store.commit('DELETE_CLASS_COACH', userId);
        displayModal(store, false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

export function showClassesPage(store) {
  preparePage(store.commit, {
    name: PageNames.CLASS_MGMT_PAGE,
  });
  const facilityId = store.getters.currentFacilityId;
  return ClassroomResource.getCollection({ parent: facilityId })
    .fetch({}, true)
    .only(
      samePageCheckGenerator(store),
      classrooms => {
        store.commit('SET_PAGE_STATE', {
          modalShown: false,
          classes: [...classrooms],
        });
        store.commit('CORE_SET_PAGE_LOADING', false);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
}

export function showClassEditPage(store, classId) {
  preparePage(store.commit, {
    name: PageNames.CLASS_EDIT_MGMT_PAGE,
  });
  const facilityId = store.getters.currentFacilityId;
  const promises = [
    FacilityUserResource.getCollection({ member_of: classId }).fetch({}, true),
    ClassroomResource.getModel(classId).fetch(),
    ClassroomResource.getCollection({ parent: facilityId }).fetch({}, true),
  ];

  const transformResults = ([facilityUsers, classroom, classrooms]) => ({
    modalShown: false,
    currentClass: classroom,
    classes: classrooms,
    classLearners: filterAndSortUsers(facilityUsers).map(_userState),
    classCoaches: filterAndSortUsers(classroom.coaches).map(_userState),
  });

  ConditionalPromise.all(promises).only(
    samePageCheckGenerator(store),
    results => {
      store.commit('SET_PAGE_STATE', transformResults(results));
      store.commit('CORE_SET_PAGE_LOADING', false);
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}

export function showLearnerClassEnrollmentPage(store, classId) {
  store.commit('CORE_SET_PAGE_LOADING', true);
  const facilityId = store.getters.currentFacilityId;
  // all users in facility
  const userPromise = FacilityUserResource.getCollection({ member_of: facilityId }).fetch();
  // current class
  const classPromise = ClassroomResource.getModel(classId).fetch();
  // users in current class
  const classUsersPromise = FacilityUserResource.getCollection({
    member_of: classId,
  }).fetch({}, true);

  return ConditionalPromise.all([userPromise, classPromise, classUsersPromise]).only(
    samePageCheckGenerator(store),
    ([facilityUsers, classroom, classUsers]) => {
      store.commit('SET_PAGE_STATE', {
        facilityUsers: facilityUsers.map(_userState),
        classUsers: classUsers.map(_userState),
        class: classroom,
        modalShown: false,
      });
      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('SET_PAGE_NAME', PageNames.CLASS_ENROLL_LEARNER);
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}
export function showCoachClassAssignmentPage(store, classId) {
  store.commit('CORE_SET_PAGE_LOADING', true);
  const facilityId = store.getters.currentFacilityId;
  // all users in facility
  const userPromise = FacilityUserResource.getCollection({ member_of: facilityId }).fetch();
  // current class
  const classPromise = ClassroomResource.getModel(classId).fetch({}, true);

  return ConditionalPromise.all([userPromise, classPromise]).only(
    samePageCheckGenerator(store),
    ([facilityUsers, classroom]) => {
      store.commit('SET_PAGE_STATE', {
        // facilityUsers now only contains users that are eligible for coachdom
        // TODO rename
        facilityUsers: facilityUsers
          // filter out users who are not eligible to be coaches
          .filter(user => {
            const eligibleRoles = [
              UserKinds.ASSIGNABLE_COACH,
              UserKinds.COACH,
              UserKinds.ADMIN,
              UserKinds.SUPERUSER,
            ];
            return user.roles.some(({ kind }) => eligibleRoles.includes(kind));
          })
          .map(_userState),
        classUsers: classroom.coaches.map(_userState),
        class: classroom,
        modalShown: false,
      });
      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('SET_PAGE_NAME', PageNames.CLASS_ASSIGN_COACH);
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}
