const assignmentID = window.location.href.split('/')[4];

let assignmentName;
let gradeText = '.grading-grade span.received-grade';
let btnSubmit = `a[href="/assignment/${assignmentID}/dropbox/submit"].link-btn`;

let assignmentArray = [];

let btnMarkDone = '#schoology-check-mark-done';
let markedDone = false;

$(document).ready(async () => {
  // Initialize variables
  assignmentName = $('h2.page-title').html();

  // Create Mark as Done button
  if ($(btnSubmit).is(':visible')) $(btnSubmit).parent().after('<div class="" id="schoology-check-mark-done"></div>');
  else $('.posted-time').after('<div class="" id="schoology-check-mark-done"></div>');

  updateMarkDoneBtn();

  $(btnMarkDone).on("click", () => {
    markedDone = !markedDone;
    updateMarkDoneBtn();
    if (markedDone) addCompletedAssignment();
    else removeCompletedAssignment();
  });

  assignmentArray = await get(assignments);

  if (!Array.isArray(assignmentArray)) {
    assignmentArray = [];
    return;
  }


  setTimeout(updateInterval, 100);

  // If assignment is completed, update markDoneBtn and markedDone.
  if (assignmentArray.some((obj) => obj.id === assignmentID)) {
    markedDone = true;
    updateMarkDoneBtn();
  }
});

/* This call to addCompletedAssignment() will do one of three things:
   * 1: If the assignment is not complete, it will do nothing
   * 2: If the assignment is complete and already stored, it will update the description and btnMarkDone
   * 3: If the assignment is complete and not stored, it will store it and update the description and btnMarkDone. */
const updateInterval = function () {
  if (addCompletedAssignment() === '') {
    if (typeof $(btnMarkDone) === "undefined") {
      if ($(btnSubmit).is(':visible')) $(btnSubmit).parent().after('<div class="" id="schoology-check-mark-done"></div>');
      else $('.posted-time').after('<div class="" id="schoology-check-mark-done"></div>');
      updateMarkDoneBtn();
    }
  }
}

const removeCompletedAssignment = function () {
  if (!(assignmentArray.some((obj) => obj.id === assignmentID))) return;

  assignmentArray = assignmentArray.filter((obj) => obj.id !== assignmentID);
  set(assignments, assignmentArray);
}

// Check if this assignment is completed, and if so, add it to storage.
const addCompletedAssignment = function () {
  // If this assignment is already completed and stored, just update the description.
  if (assignmentArray.some((obj) => obj.id === assignmentID)) {
    updateDescription();
    return;
  }

  const description = getCompletionDescription();

  if (description !== '') {
    assignmentArray.push({
      id: assignmentID,
      name: assignmentName,
      description: description
    });

    set(assignments, assignmentArray);
    return description;
  }
};

// Update text and styling of btnMarkDone
const updateMarkDoneBtn = function () {
  if (markedDone) {
    $(btnMarkDone).addClass('active');
    $(btnMarkDone).html(getCompletionDescription());
  } else {
    $(btnMarkDone).removeClass('active');
    $(btnMarkDone).html('Mark as Done');
  }
};

/* Update the description of this completed assignment.
 * For example, if this assignment was submitted, but is now graded,
 * the description should update to Graded. */
const updateDescription = function () {
  $.each(assignmentArray, (obj) => {
    if (obj.id === assignmentID) obj.description = getCompletionDescription();
  });

  set(assignments, assignmentArray);
};

/* Get the description of the completed assignment (whether it was submitted, graded, etc.)
 * If the assignment is not complete '' is returned. */
const getCompletionDescription = function () {
  // If gradeText exists
  if ($(gradeText)[0]) {
    return 'Graded';
  }

  if ($(btnSubmit).text() !== 'Submit Assignment' && $(btnSubmit).is(':visible')) {
    return 'Submitted';
  }

  if ($(btnMarkDone).hasClass('active')) {
    return 'Marked as Done';
  }

  return '';
};
