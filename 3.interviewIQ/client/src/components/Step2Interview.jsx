
// import React, { useState, useRef, useEffect } from "react";

// import maleVideo from "../assets/videos/male-ai.mp4";
// import femaleVideo from "../assets/videos/female-ai.mp4";

// import Timer from "./Timer";

// import { motion } from "motion/react";

// import axios from "axios";

// import { ServerUrl } from "../App";

// import { BsArrowRight } from "react-icons/bs";

// function Step2Interview({ interviewData, onFinish }) {
//   const { interviewId, questions, userName } = interviewData;

//   const [isIntroPhase, setIsIntroPhase] = useState(true);

//   const [isAIPlaying, setIsAIPlaying] = useState(false);

//   const [currentIndex, setCurrentIndex] = useState(0);

//   const [answer, setAnswer] = useState("");

//   const [feedback, setFeedback] = useState("");

//   // 2 minutes = 120 seconds
//   const [timeLeft, setTimeLeft] = useState(120);

//   const [selectedVoice, setSelectedVoice] = useState(null);

//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const [voiceGender, setVoiceGender] = useState("female");

//   const [subtitle, setSubtitle] = useState("");

//   const videoRef = useRef(null);

//   const currentQuestion = questions[currentIndex];

//   // ---------------------------------------
//   // LOAD AI VOICES
//   // ---------------------------------------
//   useEffect(() => {
//     const loadVoices = () => {
//       const voices = window.speechSynthesis.getVoices();

//       if (!voices.length) return;

//       // Try known female voices first
//       const femaleVoice = voices.find(
//         (v) =>
//           v.name.toLowerCase().includes("zira") ||
//           v.name.toLowerCase().includes("samantha") ||
//           v.name.toLowerCase().includes("female")
//       );

//       if (femaleVoice) {
//         setSelectedVoice(femaleVoice);
//         setVoiceGender("female");
//         return;
//       }

//       // Try known male voices
//       const maleVoice = voices.find(
//         (v) =>
//           v.name.toLowerCase().includes("david") ||
//           v.name.toLowerCase().includes("mark") ||
//           v.name.toLowerCase().includes("male")
//       );

//       if (maleVoice) {
//         setSelectedVoice(maleVoice);
//         setVoiceGender("male");
//         return;
//       }

//       // Fallback
//       setSelectedVoice(voices[0]);
//       setVoiceGender("female");
//     };

//     loadVoices();

//     window.speechSynthesis.onvoiceschanged = loadVoices;

//     return () => {
//       window.speechSynthesis.onvoiceschanged = null;
//     };
//   }, []);

//   const videoSource =
//     voiceGender === "male" ? maleVideo : femaleVideo;

//   // ---------------------------------------
//   // TEXT TO SPEECH
//   // ---------------------------------------
//   const speakText = (text) => {
//     return new Promise((resolve) => {
//       if (!window.speechSynthesis || !selectedVoice) {
//         resolve();
//         return;
//       }

//       window.speechSynthesis.cancel();

//       // Add natural pauses
//       const humanText = text
//         .replace(/,/g, ", ... ")
//         .replace(/\./g, ". ... ");

//       const utterance = new SpeechSynthesisUtterance(humanText);

//       utterance.voice = selectedVoice;

//       // Human-like pacing
//       utterance.rate = 0.92;
//       utterance.pitch = 1.05;
//       utterance.volume = 1;

//       utterance.onstart = () => {
//         setIsAIPlaying(true);

//         if (videoRef.current) {
//           videoRef.current.play();
//         }
//       };

//       utterance.onend = () => {
//         if (videoRef.current) {
//           videoRef.current.pause();
//           videoRef.current.currentTime = 0;
//         }

//         setIsAIPlaying(false);

//         setTimeout(() => {
//           setSubtitle("");
//           resolve();
//         }, 300);
//       };

//       utterance.onerror = () => {
//         setIsAIPlaying(false);

//         if (videoRef.current) {
//           videoRef.current.pause();
//           videoRef.current.currentTime = 0;
//         }

//         resolve();
//       };

//       setSubtitle(text);

//       window.speechSynthesis.speak(utterance);
//     });
//   };

//   // ---------------------------------------
//   // INTRO + QUESTIONS
//   // ---------------------------------------
//   useEffect(() => {
//     if (!selectedVoice) {
//       return;
//     }

//     const runIntro = async () => {
//       if (isIntroPhase) {
//         await speakText(
//           `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
//         );

//         await speakText(
//           "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
//         );

//         setIsIntroPhase(false);
//       } else if (currentQuestion) {
//         // Small delay before question
//         await new Promise((resolve) =>
//           setTimeout(resolve, 800)
//         );

//         // Last question message
//         if (currentIndex === questions.length - 1) {
//           await speakText(
//             "Alright, this one might be a bit more challenging."
//           );
//         }

//         // Speak current question
//         await speakText(currentQuestion.question);
//       }
//     };

//     runIntro();
//   }, [selectedVoice, isIntroPhase, currentIndex]);

//   // ---------------------------------------
//   // TIMER
//   // ---------------------------------------
//   useEffect(() => {
//     if (isIntroPhase) return;

//     if (!currentQuestion) return;

//     const timer = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           return 0;
//         }

//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [isIntroPhase, currentIndex]);

//   // ---------------------------------------
//   // RESET TIMER FOR EVERY QUESTION
//   // 2 MINUTES = 120 SECONDS
//   // ---------------------------------------
//   useEffect(() => {
//     if (!isIntroPhase && currentQuestion) {
//       setTimeLeft(120);
//     }
//   }, [currentIndex, isIntroPhase]);

//   // ---------------------------------------
//   // SUBMIT ANSWER
//   // ---------------------------------------
//   const submitAnswer = async () => {
//     if (isSubmitting) return;

//     setIsSubmitting(true);

//     try {
//       const result = await axios.post(
//         ServerUrl + "/api/interview/submit-answer",
//         {
//           interviewId,
//           questionIndex: currentIndex,
//           answer,
//           timeTaken: 120 - timeLeft,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       setFeedback(result.data.feedback);

//       // Speak feedback
//       await speakText(result.data.feedback);

//       setIsSubmitting(false);
//     } catch (error) {
//       console.log(error);

//       setIsSubmitting(false);
//     }
//   };

//   // ---------------------------------------
//   // NEXT QUESTION
//   // ---------------------------------------
//   const handleNext = async () => {
//     setAnswer("");

//     setFeedback("");

//     if (currentIndex + 1 >= questions.length) {
//       finishInterview();
//       return;
//     }

//     await speakText(
//       "Alright, let's move to the next question."
//     );

//     setCurrentIndex(currentIndex + 1);
//   };

//   // ---------------------------------------
//   // FINISH INTERVIEW
//   // ---------------------------------------
//   const finishInterview = async () => {
//     setIsSubmitting(true);

//     try {
//       const result = await axios.post(
//         ServerUrl + "/api/interview/finish",
//         {
//           interviewId,
//         },
//         {
//           withCredentials: true,
//         }
//       );

//       console.log(result.data);

//       onFinish(result.data);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // ---------------------------------------
//   // AUTO SUBMIT WHEN TIMER REACHES 0
//   // ---------------------------------------
//   useEffect(() => {
//     if (isIntroPhase) return;

//     if (!currentQuestion) return;

//     if (
//       timeLeft === 0 &&
//       !isSubmitting &&
//       !feedback
//     ) {
//       submitAnswer();
//     }
//   }, [timeLeft]);

//   // ---------------------------------------
//   // CLEANUP
//   // ---------------------------------------
//   useEffect(() => {
//     return () => {
//       window.speechSynthesis.cancel();

//       if (videoRef.current) {
//         videoRef.current.pause();
//       }
//     };
//   }, []);

//   // ---------------------------------------
//   // UI
//   // ---------------------------------------
//   return (
//     <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">

//       <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

//         {/* VIDEO SECTION */}
//         <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">

//           <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

//             <video
//               src={videoSource}
//               key={videoSource}
//               ref={videoRef}
//               muted
//               playsInline
//               preload="auto"
//               className="w-full h-auto object-cover"
//             />

//           </div>

//           {/* SUBTITLE */}
//           {subtitle && (
//             <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">

//               <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
//                 {subtitle}
//               </p>

//             </div>
//           )}

//           {/* TIMER AREA */}
//           <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">

//             <div className="flex justify-between items-center">

//               <span className="text-sm text-gray-500">
//                 Interview Status
//               </span>

//               {isAIPlaying && (
//                 <span className="text-sm font-semibold text-emerald-600">
//                   AI Speaking
//                 </span>
//               )}

//             </div>

//             <div className="h-px bg-gray-200"></div>

//             <div className="flex justify-center">

//               <Timer
//                 timeLeft={timeLeft}
//                 totalTime={120}
//               />

//             </div>

//             <div className="h-px bg-gray-200"></div>

//             <div className="grid grid-cols-2 gap-6 text-center">

//               <div>

//                 <span className="text-2xl font-bold text-emerald-600 block">
//                   {currentIndex + 1}
//                 </span>

//                 <span className="text-xs text-gray-400">
//                   Current Question
//                 </span>

//               </div>

//               <div>

//                 <span className="text-2xl font-bold text-emerald-600 block">
//                   {questions.length}
//                 </span>

//                 <span className="text-xs text-gray-400">
//                   Total Questions
//                 </span>

//               </div>

//             </div>

//           </div>

//         </div>

//         {/* TEXT SECTION */}
//         <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">

//           <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
//             AI Smart Interview
//           </h2>

//           {/* QUESTION */}
//           {!isIntroPhase && (
//             <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">

//               <p className="text-xs sm:text-sm text-gray-400 mb-2">
//                 Question {currentIndex + 1} of {questions.length}
//               </p>

//               <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
//                 {currentQuestion?.question}
//               </div>

//             </div>
//           )}

//           {/* ANSWER BOX */}
//           <textarea
//             placeholder="Type your answer here..."
//             onChange={(e) => setAnswer(e.target.value)}
//             value={answer}
//             disabled={!!feedback || isSubmitting}
//             className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
//           />

//           {/* SUBMIT / FEEDBACK */}
//           {!feedback ? (
//             <div className="flex items-center gap-4 mt-6">

//               <motion.button
//                 onClick={submitAnswer}
//                 disabled={isSubmitting || !answer.trim()}
//                 whileTap={{ scale: 0.95 }}
//                 className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:opacity-50"
//               >
//                 {isSubmitting
//                   ? "Submitting..."
//                   : "Submit Answer"}
//               </motion.button>

//             </div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
//             >

//               <p className="text-emerald-700 font-medium mb-4">
//                 {feedback}
//               </p>

//               <button
//                 onClick={handleNext}
//                 disabled={isSubmitting}
//                 className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 disabled:opacity-50"
//               >
//                 Next Question

//                 <BsArrowRight size={18} />

//               </button>

//             </motion.div>
//           )}

//         </div>

//       </div>

//     </div>
//   );
// }

// export default Step2Interview;



import React, { useState, useRef, useEffect } from "react";

import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";

import Timer from "./Timer";

import { motion } from "motion/react";

import axios from "axios";

import { ServerUrl } from "../App";

import { BsArrowRight } from "react-icons/bs";

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");

  const [timeLeft, setTimeLeft] = useState(120);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  // MIC STATES
  const [isMicOn, setIsMicOn] = useState(false);
  const [micSupported, setMicSupported] = useState(true);
  const [micError, setMicError] = useState("");

  const videoRef = useRef(null);

  // Speech Recognition
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

  const currentQuestion = questions[currentIndex];

  // --------------------------------------------------
  // LOAD SPEECH SYNTHESIS VOICES
  // --------------------------------------------------

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // --------------------------------------------------
  // MICROPHONE / SPEECH RECOGNITION SETUP
  // --------------------------------------------------

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.log("Speech Recognition is not supported.");

      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      console.log("MIC STARTED");

      isListeningRef.current = true;

      setMicError("");
    };

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript.trim()) {
        setAnswer((prev) => {
          if (!prev.trim()) {
            return finalTranscript.trim();
          }

          return prev.trim() + " " + finalTranscript.trim();
        });
      }
    };

    recognition.onerror = (event) => {
      console.log("MIC ERROR:", event.error);

      isListeningRef.current = false;

      if (event.error === "not-allowed") {
        setMicError("Microphone permission denied.");
      } else if (event.error === "network") {
        setMicError(
          "Speech recognition network error. Please try the mic again."
        );
      } else if (event.error === "no-speech") {
        setMicError("No speech detected. Please try speaking again.");
      } else {
        setMicError("Microphone error. Please try again.");
      }

      setIsMicOn(false);
    };

    recognition.onend = () => {
      console.log("MIC ENDED");

      isListeningRef.current = false;

      setIsMicOn(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (error) {
        console.log("MIC CLEANUP:", error);
      }

      isListeningRef.current = false;
    };
  }, []);

  // --------------------------------------------------
  // START MICROPHONE
  // --------------------------------------------------

  const startMic = () => {
    if (!recognitionRef.current) {
      console.log("Speech recognition not available.");
      return;
    }

    if (isListeningRef.current) {
      console.log("MIC ALREADY RUNNING");
      return;
    }

    if (isAIPlaying) {
      console.log("AI is speaking. Mic will not start.");
      return;
    }

    try {
      setMicError("");

      recognitionRef.current.start();

      setIsMicOn(true);
    } catch (error) {
      console.log("MIC START ERROR:", error);

      // This prevents duplicate start errors
      if (error.name === "InvalidStateError") {
        console.log("MIC IS ALREADY STARTED.");
        return;
      }

      setMicError("Could not start microphone.");
      setIsMicOn(false);
    }
  };

  // --------------------------------------------------
  // STOP MICROPHONE
  // --------------------------------------------------

  const stopMic = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (error) {
      console.log("MIC STOP ERROR:", error);
    }

    isListeningRef.current = false;

    setIsMicOn(false);
  };

  // --------------------------------------------------
  // TOGGLE MICROPHONE
  // --------------------------------------------------

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
  };

  // --------------------------------------------------
  // VIDEO
  // --------------------------------------------------

  const videoSource =
    voiceGender === "male" ? maleVideo : femaleVideo;

  // --------------------------------------------------
  // AI SPEECH
  // --------------------------------------------------

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      // Stop mic before AI speaks
      stopMic();

      window.speechSynthesis.cancel();

      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);

        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
        }
      };

      utterance.onend = () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }

        setIsAIPlaying(false);

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      utterance.onerror = () => {
        setIsAIPlaying(false);

        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }

        resolve();
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  // --------------------------------------------------
  // INTRO + QUESTIONS
  // --------------------------------------------------

  useEffect(() => {
    if (!selectedVoice) return;

    let cancelled = false;

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        if (cancelled) return;

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        if (cancelled) return;

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((resolve) => setTimeout(resolve, 800));

        if (cancelled) return;

        if (currentIndex === questions.length - 1) {
          await speakText(
            "Alright, this one might be a bit more challenging."
          );

          if (cancelled) return;
        }

        await speakText(currentQuestion.question);

        if (cancelled) return;

        // Start microphone after AI finishes the question
        if (micSupported) {
          setTimeout(() => {
            if (!cancelled && !isListeningRef.current) {
              startMic();
            }
          }, 500);
        }
      }
    };

    runIntro();

    return () => {
      cancelled = true;
    };
  }, [selectedVoice, isIntroPhase, currentIndex]);

  // --------------------------------------------------
  // TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);

  // --------------------------------------------------
  // RESET TIMER
  // --------------------------------------------------

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(120);
    }
  }, [currentIndex, isIntroPhase]);

  // --------------------------------------------------
  // SUBMIT ANSWER
  // --------------------------------------------------

  const submitAnswer = async () => {
    if (isSubmitting) return;

    // Stop microphone while submitting
    stopMic();

    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: 120 - timeLeft,
        },
        {
          withCredentials: true,
        }
      );

      setFeedback(result.data.feedback);

      await speakText(result.data.feedback);

      setIsSubmitting(false);
    } catch (error) {
      console.log(error);

      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // NEXT QUESTION
  // --------------------------------------------------

  const handleNext = async () => {
    stopMic();

    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
  };

  // --------------------------------------------------
  // FINISH INTERVIEW
  // --------------------------------------------------

  const finishInterview = async () => {
    stopMic();

    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        {
          interviewId,
        },
        {
          withCredentials: true,
        }
      );

      console.log(result.data);

      onFinish(result.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // AUTO SUBMIT WHEN TIMER REACHES ZERO
  // --------------------------------------------------

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  // --------------------------------------------------
  // CLEANUP
  // --------------------------------------------------

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();

      if (videoRef.current) {
        videoRef.current.pause();
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log("MIC CLEANUP:", error);
        }
      }

      isListeningRef.current = false;
    };
  }, []);

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT SIDE */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">

          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">

            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />

          </div>

          {/* SUBTITLE */}

          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">

              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>

            </div>
          )}

          {/* STATUS CARD */}

          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">

            <div className="flex justify-between items-center">

              <span className="text-sm text-gray-500">
                Interview Status
              </span>

              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600">
                  AI Speaking
                </span>
              )}

              {!isAIPlaying && isMicOn && (
                <span className="text-sm font-semibold text-red-500">
                  🎤 Listening
                </span>
              )}

            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex justify-center">
              <Timer timeLeft={timeLeft} totalTime={120} />
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="grid grid-cols-2 gap-6 text-center">

              <div>
                <span className="text-2xl font-bold text-emerald-600 block">
                  {currentIndex + 1}
                </span>

                <span className="text-xs text-gray-400">
                  Current Question
                </span>
              </div>

              <div>
                <span className="text-2xl font-bold text-emerald-600 block">
                  {questions.length}
                </span>

                <span className="text-xs text-gray-400">
                  Total Questions
                </span>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">

          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">

              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>

            </div>
          )}

          {/* ANSWER TEXTAREA */}

          <textarea
            placeholder={
              micSupported
                ? "Speak using the microphone or type your answer here..."
                : "Type your answer here..."
            }
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            disabled={!!feedback || isSubmitting}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {/* MICROPHONE SECTION */}

          {!isIntroPhase && !feedback && micSupported && (
            <div className="mt-4">

              <button
                type="button"
                onClick={toggleMic}
                disabled={isSubmitting || isAIPlaying}
                className={`w-full py-3 rounded-xl font-semibold transition shadow-md ${
                  isMicOn
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-gray-800 text-white hover:bg-gray-900"
                } disabled:opacity-50`}
              >
                {isMicOn ? "🎤 Stop Microphone" : "🎤 Start Microphone"}
              </button>

              {micError && (
                <p className="text-sm text-red-500 text-center mt-2">
                  {micError}
                </p>
              )}

            </div>
          )}

          {/* MICROPHONE NOT SUPPORTED */}

          {!isIntroPhase && !micSupported && !feedback && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Microphone speech recognition is not supported in this
              browser. You can continue by typing your answer.
            </p>
          )}

          {/* SUBMIT */}

          {!feedback ? (

            <div className="flex items-center gap-4 mt-6">

              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || !answer.trim()}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : "Submit Answer"}
              </motion.button>

            </div>

          ) : (

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >

              <p className="text-emerald-700 font-medium mb-4">
                {feedback}
              </p>

              <button
                onClick={handleNext}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1 disabled:opacity-50"
              >
                Next Question

                <BsArrowRight size={18} />

              </button>

            </motion.div>

          )}

        </div>

      </div>

    </div>
  );
}

export default Step2Interview;

