(function() {
    var stopwatchDiv = document.getElementById('stopwatch-container');
    if (stopwatchDiv) {
        document.body.removeChild(stopwatchDiv);
    } else {
        stopwatchDiv = document.createElement('div');
        stopwatchDiv.id = 'stopwatch-container';
        stopwatchDiv.style.position = 'fixed';
        stopwatchDiv.style.top = '10px';
        stopwatchDiv.style.left = '400px';
        stopwatchDiv.style.backgroundColor = 'black';
        stopwatchDiv.style.border = '1px solid grey';
        stopwatchDiv.style.borderRadius = '10px';
        stopwatchDiv.style.padding = '5px';  // Reduced padding to 5px
        stopwatchDiv.style.zIndex = '10000';
        stopwatchDiv.style.cursor = 'move';
        document.body.appendChild(stopwatchDiv);

        var timeDisplay = document.createElement('div');
        timeDisplay.id = 'stopwatch-display';
        timeDisplay.style.color = 'green';
        timeDisplay.style.fontSize = '24px';
        timeDisplay.style.fontFamily = 'monospace';
        timeDisplay.style.marginBottom = '0';  // Removed margin to make it compact
        timeDisplay.innerText = '00:00:00.00';  // Always visible, shows default time
        stopwatchDiv.appendChild(timeDisplay);

        // Alarm Checkbox and Input Field (in minutes only)
        var alarmCheckbox = document.createElement('input');
        alarmCheckbox.type = 'checkbox';
        alarmCheckbox.id = 'alarm-checkbox';
        stopwatchDiv.appendChild(alarmCheckbox);

        var alarmLabel = document.createElement('label');
        alarmLabel.for = 'alarm-checkbox';
        alarmLabel.style.color = 'white';
        alarmLabel.innerText = ' Set Alarm';
        stopwatchDiv.appendChild(alarmLabel);

        var alarmInput = document.createElement('input');
        alarmInput.type = 'number';
        alarmInput.id = 'alarm-input';
        alarmInput.placeholder = 'Minutes';
        alarmInput.style.marginLeft = '10px';
        alarmInput.style.display = 'none';
        alarmInput.style.width = '40px';  // Adjusted width to make the input smaller

        // Properly hide the up/down arrows in number inputs
        alarmInput.style['-moz-appearance'] = 'textfield';  // Firefox
        alarmInput.style['appearance'] = 'textfield';  // Standard browsers
        var css = 'input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button {-webkit-appearance: none;margin: 0;}';
        var style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);  // Inject the CSS for hiding the spin buttons

        stopwatchDiv.appendChild(alarmInput);

        alarmCheckbox.onchange = function() {
            alarmInput.style.display = alarmCheckbox.checked ? 'inline-block' : 'none';
            if (alarmCheckbox.checked) {
                alarmInput.focus();  // Focus on the input field
            }
        };

        var buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'space-between';
        buttonContainer.style.width = '100%';

        var startStopButton = document.createElement('button');
        startStopButton.innerText = 'Start';
        startStopButton.style.flex = '1';
        startStopButton.style.marginRight = '5px';
        startStopButton.onclick = function() {
            if (startStopButton.innerText === 'Start') {
                startStopwatch();
                startStopButton.innerText = 'Stop';
            } else {
                stopStopwatch();
                startStopButton.innerText = 'Start';
            }
        };
        buttonContainer.appendChild(startStopButton);

        var resetButton = document.createElement('button');
        resetButton.innerText = 'Reset';
        resetButton.style.flex = '1';
        resetButton.style.marginRight = '5px';
        resetButton.onclick = function() {
            resetStopwatch();
        };
        buttonContainer.appendChild(resetButton);

        var closeButton = document.createElement('button');
        closeButton.innerText = 'Close';
        closeButton.style.flex = '1';
        closeButton.onclick = function() {
            document.body.removeChild(stopwatchDiv);
        };
        buttonContainer.appendChild(closeButton);

        stopwatchDiv.appendChild(buttonContainer);

        var startTime, elapsedTime = 0, running = false, interval, alarmSet = false, alarmTime = null;

        // Generate 5 beeps with 0.5 seconds each
        function playAlarmSound() {
            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            for (var i = 0; i < 5; i++) {
                var oscillator = audioCtx.createOscillator();
                var startTime = audioCtx.currentTime + i * 0.6;  // Beeps spaced by 0.6 seconds
                oscillator.type = 'sine';  // Sine wave for the beep
                oscillator.frequency.setValueAtTime(440, startTime);  // Frequency set to 440 Hz
                oscillator.connect(audioCtx.destination);
                oscillator.start(startTime);  // Start each beep
                oscillator.stop(startTime + 0.5);  // Beep lasts for 0.5 seconds
            }
        }

        function updateDisplay() {
            var currentTime = Date.now();
            var timeDiff = currentTime - startTime + elapsedTime;
            var seconds = Math.floor((timeDiff / 1000) % 60);
            var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
            var hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
            var milliseconds = Math.floor((timeDiff % 1000) / 10);
            timeDisplay.innerText = (hours < 10 ? '0' + hours : hours) + ':' +
                                    (minutes < 10 ? '0' + minutes : minutes) + ':' +
                                    (seconds < 10 ? '0' + seconds : seconds) + '.' +
                                    (milliseconds < 10 ? '0' + milliseconds : milliseconds);
            
            if (alarmSet && minutes === alarmTime) {
                playAlarmSound();
                alarmSet = false; // Only sound the alarm once
            }
        }

        function startStopwatch() {
            if (!running) {
                startTime = Date.now();
                interval = setInterval(updateDisplay, 10);
                running = true;

                if (alarmCheckbox.checked && alarmInput.value) {
                    alarmTime = parseInt(alarmInput.value); // Set the alarm time in minutes
                    alarmSet = true;
                }
            }
        }

        function stopStopwatch() {
            if (running) {
                clearInterval(interval);
                elapsedTime += Date.now() - startTime;
                running = false;
            }
        }

        function resetStopwatch() {
            clearInterval(interval);
            running = false;
            elapsedTime = 0;
            timeDisplay.innerText = '00:00:00.00';
            startStopButton.innerText = 'Start';
            // Keep the alarmSet and alarmTime active after reset
        }

        stopwatchDiv.onmousedown = function(event) {
            event.preventDefault();
            var shiftX = event.clientX - stopwatchDiv.getBoundingClientRect().left;
            var shiftY = event.clientY - stopwatchDiv.getBoundingClientRect().top;
            document.onmousemove = function(event) {
                stopwatchDiv.style.left = event.clientX - shiftX + 'px';
                stopwatchDiv.style.top = event.clientY - shiftY + 'px';
            };
            document.onmouseup = function() {
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };

        stopwatchDiv.ondragstart = function() {
            return false;
        };
    }
})();
