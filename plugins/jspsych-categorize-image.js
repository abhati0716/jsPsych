/**
 * jspsych plugin for categorization trials with feedback
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 **/


jsPsych.plugins['categorize-image'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('categorize-image', 'stimulus', 'image');

  plugin.info = {
    name: 'categorize-image',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        default: undefined,
        no_function: false,
        description: ''
      },
      key_answer: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: undefined,
        no_function: false,
        description: ''
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        default: jsPsych.ALL_KEYS,
        array: true,
        no_function: false,
        description: ''
      },
      text_answer: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '',
        no_function: false,
        description: ''
      },
      correct_text: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "<p class='feedback'>Correct</p>",
        no_function: false,
        description: ''
      },
      incorrect_text: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "<p class='feedback'>Incorrect</p>",
        no_function: false,
        description: ''
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '',
        no_function: false,
        description: ''
      },
      force_correct_button_press: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        no_function: false,
        description: ''
      },
      show_stim_with_feedback: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        no_function: false,
        description: ''
      },
      show_feedback_on_timeout: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        no_function: false,
        description: ''
      },
      timeout_message: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "<p>Please respond faster.</p>",
        no_function: false,
        description: ''
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      feedback_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: 2000,
        no_function: false,
        description: ''
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    display_element.innerHTML = '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="'+trial.stimulus+'"></img>';

    // hide image after time if the timing parameter is set
    if (trial.stimulus_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-categorize-image-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // if prompt is set, show prompt
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

    var trial_data = {};

    // create response function
    var after_response = function(info) {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // clear keyboard listener
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      var correct = false;
      if (trial.key_answer == info.key) {
        correct = true;
      }

      // save data
      trial_data = {
        "rt": info.rt,
        "correct": correct,
        "stimulus": trial.stimulus,
        "key_press": info.key
      };

      display_element.innerHTML = '';

      var timeout = info.rt == -1;
      doFeedback(correct, timeout);
    }

    jsPsych.pluginAPI.getKeyboardResponse({
      callback_function: after_response,
      valid_responses: trial.choices,
      rt_method: 'date',
      persist: false,
      allow_held_key: false
    });

    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        after_response({
          key: -1,
          rt: -1
        });
      }, trial.trial_duration);
    }

    function doFeedback(correct, timeout) {

      if (timeout && !trial.show_feedback_on_timeout) {
        display_element.innerHTML += trial.timeout_message;
      } else {
        // show image during feedback if flag is set
        if (trial.show_stim_with_feedback) {
          display_element.innerHTML = '<img id="jspsych-categorize-image-stimulus" class="jspsych-categorize-image-stimulus" src="'+trial.stimulus+'"></img>';
        }

        // substitute answer in feedback string.
        var atext = "";
        if (correct) {
          atext = trial.correct_text.replace("%ANS%", trial.text_answer);
        } else {
          atext = trial.incorrect_text.replace("%ANS%", trial.text_answer);
        }

        // show the feedback
        display_element.innerHTML += atext;
      }
      // check if force correct button press is set
      if (trial.force_correct_button_press && correct === false && ((timeout && trial.show_feedback_on_timeout) || !timeout)) {

        var after_forced_response = function(info) {
          endTrial();
        }

        jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_forced_response,
          valid_responses: [trial.key_answer],
          rt_method: 'date',
          persist: false,
          allow_held_key: false
        });

      } else {
        jsPsych.pluginAPI.setTimeout(function() {
          endTrial();
        }, trial.feedback_duration);
      }

    }

    function endTrial() {
      display_element.innerHTML = '';
      jsPsych.finishTrial(trial_data);
    }

  };

  return plugin;
})();
