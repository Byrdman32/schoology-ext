const assignmentID = window.location.href.split('/')[4];

let assignmentName;
let gradeText = '.grading-grade span.received-grade';
let btnSubmit = `a[href="/assignment/${assignmentID}/dropbox/submit"].link-btn`;

let assignmentArray = [];

let btnMarkDone = '#schoology-check-mark-done';
let markedDone = false;
let manOverride = false;

$(document).ready(async () => {
  // Initialize variables
  assignmentName = $('h2.page-title').html();

  // Get assignmentArray from storage and update markedDone
  assignmentArray = await get(assignments);
  markedDone = assignmentArray.some((obj) => obj.id === assignmentID);


  // Create Mark as Done button
  if ($(btnSubmit).is(':visible')) $(btnSubmit).parent().after('<div class="" id="schoology-check-mark-done"></div>');
  else $('.posted-time').after('<div class="" id="schoology-check-mark-done"></div>');

  updateState();

  $(btnMarkDone).on("click", () => {
    markedDone = !markedDone;
    manOverride = true;

    if (markedDone) {
      $(btnMarkDone).addClass('active');

      const description = getCompletionDescription();
      if (description !== '') addCompletedAssignment(description);
    } else {
      $(btnMarkDone).removeClass('active');
      removeCompletedAssignment();
    }

    updateBtnMarkDone();
  });


});

// Update the state of the assignment--whether or not its completed, and btnMarkDone
// This will mark assignment as done if user submits the assignment
const updateState = function () {
  /* If the user has interacted with the button (ie. to manually mark a completed assignment as incomplete),
   * then the assignment should not automatically complete or incomplete itself.
   * Instead, the description of the assignment (if it is completed should update)
   * (ie. if the assignment was manually marked done, then submitted, the extension should record "Submitted")
   * and the button should be updated.
   */

  if (manOverride) {
    if (assignmentArray.some((obj) => obj.id === assignmentID && obj.description !== getCompletionDescription())) {
      assignmentArray.forEach((obj) => {
        if (obj.id === assignmentID) obj.description = getCompletionDescription();
      });
    }
  } else {
    // If assignment is submitted or graded, add it to storage
    if (getCompletionDescription() !== '') {
      addCompletedAssignment(getCompletionDescription());
      markedDone = true;
      if (markedDone) $(btnMarkDone).addClass('active');
    }
  }

  updateBtnMarkDone();
  setTimeout(updateState, 100);
}

// Mark this assignment as completed, and add it to storage
const addCompletedAssignment = function (description) {
  if (!assignmentArray.some((obj) => obj.id === assignmentID)) {
    assignmentArray.push({
      id: assignmentID,
      name: assignmentName,
      description: description
    });
  }

  set(assignments, assignmentArray);
}

// Mark this assignment as incomplete, and remove it from storage
const removeCompletedAssignment = function () {
  assignmentArray.filter((obj) => obj.id !== assignmentID);
  set(assignments, assignmentArray);

}

// Make button visible if it disappeared, and update its description
const updateBtnMarkDone = function () {
  if (!$(btnMarkDone).is(":visible")) $(btnMarkDone).show();
  $(btnMarkDone).html(markedDone ? getCompletionDescription() : 'Mark as Done');
}

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

  if (markedDone) {
    return 'Marked as Done';
  }

  return '';
};
