const express = require("express");
const { crashPointFromHash } = require("./hashseed");
const CrashHash = require("../model/crash_hash");
const {
  handleCrashHistory,
  handleGameCrash,
  handleRedTrendballEl,
  handleMoonTrendballEl,
} = require("./crashStore.js");
//
const cors = require("cors")({
  origin: [
    // 'http://localhost:5173',
    "https://dotplayplay.netlify.app",
  ],
});

const sseApp = express();
sseApp.use(cors);

class SSE {
  constructor(res) {
    this.res = res;
    this.res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    this.res.write("SERVER EVENTS:::>\n\n");
  }
  emit(event, data) {
    this.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }
}

class CrashGameEngine {
  constructor() {
    this.timeLoop = null;
    this.multiplier = null;
    this.crashCurve = null;
    this.clients = [];
    this.hashList = [];
    this.load_animate = 100;
    this.pre_crashId = [];
    this.is_consumed = 1;
    this.v_default = 0;
    this.v_two = 0;

    process.on("beforeExit", () => {
      console.log("Stoping game");
      this.stop();
    });
  }

  registerEvents(req, res) {
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      event: new SSE(res),
    };
    this.clients.push(newClient);
    req.on("close", () => {
      console.log(`${clientId} Connection closed`);
      this.clients = this.clients.filter((client) => client.id !== clientId);
    });
  }

  stop() {
    if (this.multiplier) clearInterval(this.multiplier);
    if (this.timeLoop) clearInterval(this.timeLoop);
    if (this.crashCurve) clearInterval(this.crashCurve);
    if (this.countDown) clearInterval(this.countDown);
  }

  broadcast(event, data) {
    if (!this.clients.length) return;
    this.clients.forEach((client) => {
      client.event.emit(event, data);
    });
  }

  handleCrashHistoryUpdate(data) {
    if (this.pre_crashId.length > 30) {
      this.pre_crashId.shift(data);
      this.pre_crashId.push(data);
    } else {
      this.pre_crashId.push(data);
    }
    this.broadcast("crash_details", this.pre_crashId);
  }

  handleCrashed(crash_point) {
    let data = {
      game_id: crash_point.game_id,
      game_hash: crash_point.hash,
      crash_point_stop: crash_point.crash_point,
      is_running: false,
      is_loading: false,
      is_crashed: true,
    };
    this.broadcast("countdown", data);
    handleCrashHistory(crash_point);
    handleGameCrash(crash_point);
    handleRedTrendballEl(crash_point);
    // game.fetchUsersBets()
    game.handleCrashHistoryUpdate(crash_point);
    // handleGreenTrendballEl(crash_point)
    // handleMoonTrendballEl(crash_point)
    // auto = []
  }

  HandlecrashCurve(event) {
    let count = 0;
    this.crashCurve = setInterval(() => {
      if (count < 590) {
        count += 0.94;
      } else {
        count = 586.6;
      }
      this.broadcast("nuppp-curve", count.toFixed(2));
    }, 5);
  }

  HandleMultiplier(point) {
    let crash_point = point;
    let multiplierEL = 1;
    let speed = 0.01;
    let trigger = 1;
    let triggerEk = 1;
    game.HandlecrashCurve(34);
    this.multiplier = setInterval(async () => {
      if (multiplierEL >= crash_point.crash_point) {
        clearInterval(this.multiplier);
        if (multiplierEL.toFixed(2) < 2) {
          // handleRedtrendballCashout(crash_point.game_id)
          // handleGreenTrendball(crash_point)
        } else if (multiplierEL.toFixed(2) < 10) {
          // handleMoonTrendball(crash_point)
        }
        game.handleCrashed(crash_point);
        speed = 0.01;
        clearInterval(this.crashCurve);
        setTimeout(() => {
          game.startCountDown(5);
          // game.fetchPreviousCrashHistory(crash_point)
          this.load_animate = 100;
        }, 3000);
      } else {
        // game.fetch_activePlayers(crash_point.game_id)
        // handleAuto_cashout(multiplierEL.toFixed(2), crash_point.game_id)
        if (multiplierEL.toFixed(2) > 1.98 && multiplierEL.toFixed(2) < 2.99) {
          speed = 0.0352;
          // handle_V_two(0.8, 1)
          // handleRedTrendball(crash_point)
          const called = () => {
            if (trigger) {
              // handleGreentrendballCashout(crash_point.game_id)
              trigger = 0;
            }
          };
          called();
          if (
            multiplierEL.toFixed(2) > 2.36 &&
            multiplierEL.toFixed(2) < 2.76
          ) {
            // handle_H_Twelve(1.2, 1)
            // handle_H_Four(0.36, 1)
            // handle_H_Ten(0.9, 1)
            // handle_H_Two(0.167, 1)
            // handle_H_Six(0.6, 1)
            // handle_H_Eight(0.8, 1)
          } else if (multiplierEL.toFixed(2) > 2.76) {
            // handle_H_Four(0.24, 1)
            // handle_H_Six(0.4, 1)
            // handle_H_Twelve(0.9, 1)
            // handle_h_fourteen(1.4, 1)
            // handle_H_Ten(0.77, 1)
            // handle_H_Two(0.188, 1)
            // handle_H_Eight(0.6, 1)
          } else {
            // handle_H_Two(0.2, 1)
            // handle_H_Four(0.5, 1)
            // handle_H_Six(0.7, 1)
            // handle_H_Eight(0.84, 1)
            // handle_H_Ten(1.109, 1)
          }
        } else if (
          multiplierEL.toFixed(2) > 2.99 &&
          multiplierEL.toFixed(2) < 4.99
        ) {
          speed = 0.0852;
          if (multiplierEL.toFixed(2) > 4.5) {
            // handle_V_two(0.6, 0)
            // handle_H_Two(0.02, 1)
            // handle_H_Four(0.02, 1)
            // handle_H_Six(0.01, 1)
            // handle_H_Eight(0.02, 1)
            // handle_H_Ten(0.013, 1)
            // handle_H_Twelve(0.02, 1)
            // handle_h_fourteen(0.02, 1)
            // handle_h_sixteen(0.040, 1)
            // handle_h_eighteen(0.06, 1)
          } else {
            if (multiplierEL.toFixed(2) > 3.5) {
              // handle_h_fourteen(0.1, 1)
              // handle_H_Two(0.02, 1)
              // handle_H_Four(0.02, 1)
              // handle_H_Six(0.02, 1)
              // handle_H_Eight(0.02, 1)
              // handle_H_Ten(0.1, 1)
              // handle_H_Twelve(0.08804, 1)
              // handle_h_sixteen(0.15, 1)
              // handle_h_eighteen(0.27, 1)
            } else {
              // handle_H_Two(0.05, 1)
              // handle_H_Four(0.03, 1)
              // handle_H_Six(0.01, 1)
              // handle_H_Eight(0.02, 1)
              // handle_H_Ten(0.1, 1)
              // handle_H_Twelve(0.22, 1)
              // handle_h_fourteen(0.56, 1)
              // handle_h_sixteen(0.80, 1)
            }
            // handle_V_two(0.7, 1)
          }
          // handle_V_three(0.7, 1)
        } else if (
          multiplierEL.toFixed(2) > 4.99 &&
          multiplierEL.toFixed(2) < 6.99
        ) {
          speed = 0.1052;
          // handle_V_three(0.4, 1)
          // handle_V_Five(0.73, 1)
          if (multiplierEL.toFixed(2) > 6.2 && multiplierEL.toFixed(2) < 5.5) {
            // handle_h_twenty(0.3, 1)
            // handle_H_Ten(0.2, 1)
          } else if (multiplierEL.toFixed(2) > 5.5) {
            // handle_h_twenty(0.3, 1)
            // handle_H_Ten(0.2, 1)
          } else {
            // handle_H_Two(0.00, 0)
            // handle_H_Four(0.01, 0)
            // handle_H_Six(0.08, 0)
            // handle_H_Eight(0.02, 0)
            // handle_H_Ten(0.2, 1)
            // handle_H_Twelve(0.02431860, 0)
            // handle_h_fourteen(0.02, 0)
            // handle_h_sixteen(0.04, 0)
            // handle_h_eighteen(0.046, 0)
            // handle_h_twenty(0.3, 1)
          }
        } else if (
          multiplierEL.toFixed(2) > 6.99 &&
          multiplierEL.toFixed(2) < 9.99
        ) {
          speed = 0.1552;
          if (multiplierEL.toFixed(2) > 9) {
            // handle_V_Nine(0.6, 1)
          }
          // handle_V_three(0.16, 1)
          // handle_V_Five(0.3, 1)
          // handle_V_Seven(0.7, 1)
          // handle_h_twenty(0.3, 1)
          // handle_H_Ten(0.3, 1)
        } else if (
          multiplierEL.toFixed(2) > 9.99 &&
          multiplierEL.toFixed(2) < 14.99
        ) {
          speed = 0.2552;
          // handle_V_three(0.16, 0)
          // handle_V_Five(0.3, 0)
          // handle_V_Seven(0.7, 0)
          // handle_V_Ten(0.6, 1)
          // handle_V_Nine(0.6, 0)
          const called = () => {
            if (triggerEk) {
              // handleMoontrendballCashout(crash_point.game_id)
              triggerEk = 0;
            }
          };
          // called()
          // handle_H_Ten(0.3, 0)
          // handle_h_twenty(0.3, 1)
        } else if (
          multiplierEL.toFixed(2) > 14.99 &&
          multiplierEL.toFixed(2) < 19.99
        ) {
          speed = 0.5552;
          // handle_V_Ten(0.6, 1)
          // handle_h_thirthy(0.3, 1)
          // handle_h_twenty(0.3, 1)
        } else if (
          multiplierEL.toFixed(2) > 19.99 &&
          multiplierEL.toFixed(2) < 50.99
        ) {
          speed = 0.7552;
          if (multiplierEL.toFixed(2) > 30.99) {
            // handle_V_Twenty(0.3, 1)
            // handle_V_Ten(0.2, 0)
            // handle_h_thirthy(0.3, 1)
            // handle_h_twenty(0.3, 0)
          } else {
            // handle_V_Twenty(0.5, 1)
            // handle_V_Ten(0.2, 1)
            // handle_h_thirthy(0.3, 1)
            // handle_h_twenty(0.3, 0)
          }
        } else if (
          multiplierEL.toFixed(2) > 50.99 &&
          multiplierEL.toFixed(2) < 100.99
        ) {
          speed = 0.9552;
          if (multiplierEL.toFixed(2) > 70.99) {
            // handle_V_Fivety(0.2, 1)
            // handle_h_fourty(0.3, 1)
            // handle_h_thirthy(0.3, 0)
          } else {
            // handle_V_Fivety(0.4, 1)
            // handle_V_Twenty(0.4, 0)
            // handle_V_Ten(0.2, 0)
            // handle_h_thirthy(0.3, 0)
            // handle_h_fourty(0.3, 1)
            // handle_h_twenty(0.3, 0)
          }
        } else if (
          multiplierEL.toFixed(2) > 100.99 &&
          multiplierEL.toFixed(2) < 200
        ) {
          speed = 1.5552;
          if (multiplierEL.toFixed(2) > 150.99) {
            // handle_V_Hundred(0.16, 1)
          } else {
            // handle_V_Fivety(0.6, 0)
            // handle_V_Hundred(0.3, 1)
            // handle_h_fourty(0.3, 1)
            // handle_h_thirthy(0.3, 0)
          }
        }
        if (multiplierEL.toFixed(2) > 200 && multiplierEL.toFixed(2) < 500) {
          // handle_V_Hundred(0.1, 0)
          speed = 2.5552;
          if (multiplierEL.toFixed(2) > 250.99) {
            // handle_h_fourty(0.01, 0)
            // handle_V_TwoHundred(0.07, 1)
          } else {
            // handle_h_fourty(0.01, 0.04)
            // handle_V_TwoHundred(0.13, 1)
          }
        }
        if (multiplierEL.toFixed(2) > 500 && multiplierEL.toFixed(2) < 1000) {
          speed = 5.5552;
          // handle_h_sixty(0.06, 1)
          // handle_V_TwoHundred(0.17, 0)
          // handle_V_FiveHundred(0.07, 1)
        }
        if (multiplierEL.toFixed(2) > 1000) {
          speed = 10.5552;
          // handle_V_FiveHundred(0.05, 0)
          // handle_V_Thousand(0.05, 1)
        }
        this.broadcast("countdown", {
          crash_point: multiplierEL.toFixed(2),
          is_running: true,
          is_loading: false,
          is_crashed: false,
        });
      }
      multiplierEL += speed;
    }, 50);
  }

  async fetchHashes() {
    try {
      const crashes = await CrashHash.find();
      crashes.forEach((element) => {
        this.hashList.push(element);
      });
      if (crashes) {
        game.startCountDown(5);
      }
      return crashes;
    } catch (error) {
      console.log("There no crash hash or Network issues", error);
    }
  }

  startCountDown(e) {
    this.counter = 1;
    let ty = this.hashList[this.hashList.length - this.is_consumed];
    let detail = crashPointFromHash(ty);
    this.is_consumed++;
    let timeSec = e;
    this.timeLoop = setInterval(() => {
      if (timeSec.toFixed(2) <= 0.1) {
        clearInterval(this.timeLoop);
        game.HandleMultiplier(detail);
      } else {
        //   game.fetch_activePlayers(detail.game_id)
        timeSec -= 0.01;
        this.load_animate -= 0.198;
        let pis = {
          timeSec,
          load_animate: this.load_animate,
          game_id: detail.game_id,
          is_running: false,
          is_loading: true,
          is_crashed: false,
        };
        this.broadcast("countdown", pis);
      }
    }, 10);
  }
  handleCrashLoad() {}
}

const game = new CrashGameEngine();
sseApp.get("/crash-engine", (req, res) => {
  game.registerEvents(req, res);
});

game.fetchHashes();
module.exports = sseApp;
