require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mic = require("mic");
const axios = require("axios");
const FormData = require("form-data");
const sox = require("sox-stream");
const { HueService } = require("./hue-service");
const GroqSynesthesiaAgent = require("./agents/mood-song-agent.js");

const { processSecondAgentResponse } = require("./utils");
const { logResponse, logWithTimestamp } = require("./logger.js");
const chalkOriginal = import("chalk").then(m => m.default);

const SEGMENT_DURATION = 5000;

class AudioRecorder {
  constructor(micConfig, outputFolder) {
    this.micInstance = mic(micConfig);
    this.outputFolder = outputFolder;
    this.micInputStream = this.micInstance.getAudioStream();
    this.currentSegmentPath = null;
    this.currentSegmentStream = null;
    this.segmentCounter = 0;
    this.hueService = new HueService(
      process.env.PHILIPS_HUE_KEY,
      process.env.PHILIPS_HUE_IP
    );
  }

  async startRecording() {
    await this.hueService.connect();
    this.micInstance.start();
    this.createNewSegment();
    this.micInputStream.on("data", data => {
      if (this.currentSegmentStream) {
        this.currentSegmentStream.write(data);
      }
    });
    setInterval(() => {
      this.endCurrentSegment();
      this.createNewSegment();
    }, SEGMENT_DURATION);
  }

  async endCurrentSegment() {
    if (this.currentSegmentStream) {
      this.currentSegmentStream.end();
      this.currentSegmentStream = null;
      await this.processSegment(this.currentSegmentPath);
    }
  }

  async transcribeAudio(segmentPath) {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(segmentPath));
    formData.append("model", "whisper-1");
    const headers = {
      ...formData.getHeaders(),
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    };
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/audio/transcriptions",
        formData,
        {
          headers: headers,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );
      return response.data.text;
    } catch (error) {
      console.error("Error durante la transcripción:", error.response.data);
      throw error;
    }
  }

  createNewSegment() {
    this.segmentCounter++;
    this.currentSegmentPath = path.join(
      this.outputFolder,
      `segment_${this.segmentCounter}.raw`
    );
    this.currentSegmentStream = fs.createWriteStream(this.currentSegmentPath);
  }

  async processSegment(segmentPath) {
    try {
      const wavSegmentPath = segmentPath.replace(".raw", ".wav");
      await this.convertRawToWav(segmentPath, wavSegmentPath);
      const transcription = await this.transcribeAudio(wavSegmentPath);
      console.log(
        `Transcripción del segmento ${this.segmentCounter}:`,
        transcription
      );

      const groqSynesthesiaAgent = new GroqSynesthesiaAgent();
      const agentResponse = await groqSynesthesiaAgent.processInput({
        input: transcription,
      });
      //   const agentResponse = await this.groqSynesthesiaAgent.processInput({
      //     input: transcription,
      //   });
      await logResponse(
        "Synesthesia Agent",
        `Received color settings: ${agentResponse}`
      );

      const colors = processSecondAgentResponse(agentResponse);
      const chalk = await chalkOriginal;
      const lights = await this.hueService.getAllLights();

      if (lights.length < 3) {
        logWithTimestamp(
          chalk.red("Error: Se necesitan al menos 3 focos para continuar.")
        );
        return;
      }

      await this.hueService.updateLightColors(lights, colors);
      logWithTimestamp(chalk.green("Done!"));

      fs.unlinkSync(segmentPath);
      fs.unlinkSync(wavSegmentPath);
    } catch (error) {
      console.error(
        `Error al procesar el segmento ${this.segmentCounter}:`,
        error
      );
    }
  }

  async convertRawToWav(rawSegmentPath, wavSegmentPath) {
    return new Promise((resolve, reject) => {
      const inputStream = fs.createReadStream(rawSegmentPath);
      const outputStream = fs.createWriteStream(wavSegmentPath);
      const soxProcess = sox({
        input: {
          type: "raw",
          rate: 16000,
          channels: 1,
          encoding: "signed-integer",
          bits: 16,
          endian: "little",
        },
        output: {
          type: "wav",
          rate: 16000,
          channels: 1,
          encoding: "signed-integer",
          bits: 16,
          endian: "little",
        },
      });
      inputStream.pipe(soxProcess).pipe(outputStream);
      outputStream.on("finish", () => {
        resolve();
      });
      outputStream.on("error", error => {
        reject(error);
      });
    });
  }
}

// Configuración del micrófono
const micConfig = {
  rate: "16000",
  channels: "1",
  debug: false,
  exitOnSilence: 6,
};

// Carpeta de salida para los segmentos de audio
const outputFolder = "./audio_segments";

// Crear la carpeta de salida si no existe
if (!fs.existsSync(outputFolder)) {
  fs.mkdirSync(outputFolder);
}

// Iniciar la grabación y el procesamiento de audio
const audioRecorder = new AudioRecorder(micConfig, outputFolder);
audioRecorder.startRecording().catch(error => {
  console.error("An error occurred:", error);
});

// const fs = require("fs");
// const path = require("path");
// const mic = require("mic");
// const axios = require("axios");
// const FormData = require("form-data");
// const sox = require("sox-stream");

// const SEGMENT_DURATION = 5000; // Duración de cada segmento de audio en milisegundos

// class AudioRecorder {
//   constructor(micConfig, outputFolder) {
//     this.micInstance = mic(micConfig);
//     this.outputFolder = outputFolder;
//     this.micInputStream = this.micInstance.getAudioStream();
//     this.currentSegmentPath = null;
//     this.currentSegmentStream = null;
//     this.segmentCounter = 0;
//   }

//   startRecording() {
//     this.micInstance.start();
//     this.createNewSegment();
//     this.micInputStream.on("data", data => {
//       if (this.currentSegmentStream) {
//         this.currentSegmentStream.write(data);
//       }
//     });
//     setInterval(() => {
//       this.endCurrentSegment();
//       this.createNewSegment();
//     }, SEGMENT_DURATION);
//   }

//   endCurrentSegment() {
//     if (this.currentSegmentStream) {
//       this.currentSegmentStream.end();
//       this.currentSegmentStream = null;
//       this.processSegment(this.currentSegmentPath);
//     }
//   }

//   async transcribeAudio(segmentPath) {
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(segmentPath));
//     formData.append("model", "whisper-1");

//     const headers = {
//       ...formData.getHeaders(),
//       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//     };

//     try {
//       const response = await axios.post(
//         "https://api.openai.com/v1/audio/transcriptions",
//         formData,
//         {
//           headers: headers,
//           maxContentLength: Infinity,
//           maxBodyLength: Infinity,
//         }
//       );

//       return response.data.text;
//     } catch (error) {
//       console.error("Error durante la transcripción:", error.response.data);
//       throw error;
//     }
//   }

//   createNewSegment() {
//     this.segmentCounter++;
//     this.currentSegmentPath = path.join(
//       this.outputFolder,
//       `segment_${this.segmentCounter}.raw`
//     );
//     this.currentSegmentStream = fs.createWriteStream(this.currentSegmentPath);
//   }

//   async processSegment(segmentPath) {
//     try {
//       const wavSegmentPath = segmentPath.replace(".raw", ".wav");
//       await this.convertRawToWav(segmentPath, wavSegmentPath);
//       const transcription = await this.transcribeAudio(wavSegmentPath);
//       console.log(
//         `Transcripción del segmento ${this.segmentCounter}:`,
//         transcription
//       );
//       // Aquí puedes llamar a tu agente de Groq para procesar el texto
//       fs.unlinkSync(segmentPath);
//       fs.unlinkSync(wavSegmentPath);
//     } catch (error) {
//       console.error(
//         `Error al procesar el segmento ${this.segmentCounter}:`,
//         error
//       );
//     }
//   }

//   async convertRawToWav(rawSegmentPath, wavSegmentPath) {
//     return new Promise((resolve, reject) => {
//       const inputStream = fs.createReadStream(rawSegmentPath);
//       const outputStream = fs.createWriteStream(wavSegmentPath);

//       const soxProcess = sox({
//         input: {
//           type: "raw",
//           rate: 16000,
//           channels: 1,
//           encoding: "signed-integer",
//           bits: 16,
//           endian: "little",
//         },
//         output: {
//           type: "wav",
//           rate: 16000,
//           channels: 1,
//           encoding: "signed-integer",
//           bits: 16,
//           endian: "little",
//         },
//       });

//       inputStream.pipe(soxProcess).pipe(outputStream);

//       outputStream.on("finish", () => {
//         resolve();
//       });

//       outputStream.on("error", error => {
//         reject(error);
//       });
//     });
//   }
// }

// // Configuración del micrófono
// const micConfig = {
//   rate: "16000",
//   channels: "1",
//   debug: false,
//   exitOnSilence: 6,
// };

// // Carpeta de salida para los segmentos de audio
// const outputFolder = "./audio_segments";

// // Crear la carpeta de salida si no existe
// if (!fs.existsSync(outputFolder)) {
//   fs.mkdirSync(outputFolder);
// }

// // Iniciar la grabación y el procesamiento de audio
// const audioRecorder = new AudioRecorder(micConfig, outputFolder);
// audioRecorder.startRecording();
