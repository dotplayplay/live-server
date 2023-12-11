const { format } = require('date-fns');
const crypto = require("crypto")
const currentTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
const { crashPointFromHash } = require("./hashseed")
const { handleCrashHistory, handleGameCrash, handleMoonTrendballEl } = require("./crashStore.js")
const { handleProfileTransactions } = require("../profile_mangement/index")
const { handleRechargeimplement } = require("../profile_mangement/cashbacks")
const { handleMonthlyCashbackImplementation } = require("../profile_mangement/monthlycashback")
const { handleWeeklyCashbackImplementation } = require("../profile_mangement/week_cashback")
const CrashHash = require("../model/crash_hash")
const CrashGame = require("../model/crashgame")
const CrashHistory = require("../model/crash-game-history")
const CashBackDB = require("../model/cash_back")
const Wallet = require("../model/wallet")
const USDT_wallet = require("../model/Usdt-wallet")
const PPFWallet = require("../model/PPF-wallet");
let is_consumed = 1

const express = require('express')
const cors = require('cors')({
  origin: [
    // 'http://localhost:5173',
     "https://dotplayplay.netlify.app"
  ],
});
const sseApp = express();
sseApp.use(cors);



class SSE {
  constructor(res) {
    this.res = res;
    this.res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    this.res.write('SERVER EVENTS:::>\n\n');
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
    this.load_animate = 100

    process.on('beforeExit', () => {
      console.log("Stoping game");
      this.stop();
    })
  }

  // async start() {


    
  //   // ==================== fetch single active users bets ==================================
  //   const fetchUsersBets = (async () => {
  //     const data = await CrashGame.find()
  //     this.broadcast("my-bet", data)
  //   })

  //   const fetch_activePlayers = (async (game_id) => {
  //     try {
  //       // const data = await CrashGame.find({game_id})
  //       // this.broadcast("active_players", data)
  //       // this.broadcast("crash-game-redtrend", data)
  //     }
  //     catch (error) {
  //       console.log("Could not find games")
  //     }
  //   })

  //   const fetchPreviousCrashHistory = (async () => {
  //     const data = await CrashHistory.find()
  //     this.broadcast("crash-game-history", data)
  //   })


  //   const autobetWallet = (async (event) => {
  //     let current_amount;
  //     if (event.token === "PPF") {
  //       let skjk = await PPFWallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 1.98
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await PPFWallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     if (event.token === "USDT") {
  //       let skjk = await USDT_wallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 1.98
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await USDT_wallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     //  this.broadcast("redball_update_wallet", {update_bal:current_amount, ...event})
  //     await CrashGame.updateOne({
  //       user_id: event.user_id,
  //       game_id: event.game_id,
  //       game_type: "Classic"
  //     }, {
  //       game_status: false,
  //       user_status: false,
  //       cashout: parseFloat(event.auto_cashout) - 0.01,
  //       profit: (parseFloat(event.bet_amount) * parseFloat(event.auto_cashout)) - parseFloat(event.bet_amount) - 0.01,
  //       has_won: true
  //     })

  //     //  this.broadcast("crash-autobet-users", "is-crash")
  //   })

  //   let auto = []
  //   const handleAuto_cashout = (async (event, point) => {
  //     let data = await CrashGame.find({ game_type: "Classic", game_id: point })
  //     for (let i = 0; i < data.length; i++) {
  //       if (event > data[i].auto_cashout) {
  //         if (data[i].user_status) {
  //           if (!auto.includes(data[i].user_id)) {
  //             auto.push(data[i].user_id)
  //             autobetWallet(data[i])
  //           }
  //         }
  //       }
  //     }
  //   })

  //   //  ============================================ Red trendball section ==================================================


  //   // Get player's wallet
  //   const GetRedtrendWallet = (async (event, game_id) => {
  //     let current_amount;
  //     if (event.token === "PPF") {
  //       let skjk = await PPFWallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 1.98
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await PPFWallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     if (event.token === "USDT") {
  //       let skjk = await USDT_wallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 1.98
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await USDT_wallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }


  //     await CrashGame.updateOne({
  //       user_id: event.user_id,
  //       game_id: game_id,
  //       game_type: "Red"
  //     }, {
  //       game_status: false,
  //       user_status: false,
  //       cashout: 1.98,
  //       profit: parseFloat(event.bet_amount) * 1.98,
  //       payout: 1.98,
  //       has_won: true
  //     })
  //     // this.broadcast("redball_update_wallet", {update_bal:current_amount, ...event})
  //     // this.broadcast("crash-all-redball-users", "is-crash")
  //   })


  //   // Notify winning update
  //   const handleRedtrendballCashout = (async (game_id) => {
  //     let data = await CrashGame.find({ game_id: game_id, game_type: "Red" })
  //     for (let i = 0; i < data.length; i++) {
  //       GetRedtrendWallet(data[i], game_id)
  //       // this.broadcast("crash-all-redball-users", "has_win")
  //     }
  //   })

  //   //================== update payout and crash hash ===========================
  //   const handleRedTrendballEl = (async (game) => {
  //     await CrashGame.updateMany({
  //       game_id: game.game_id,
  //       game_type: "Red"
  //     }, {
  //       game_status: false,
  //       payout: game.crashpoint,
  //       game_hash: game.hash
  //     })
  //   })

  //   //  ====== red trend ball lost ============
  //   const handleRedTrendball = (async (game) => {
  //     if (game.game_id !== undefined) {
  //       await CrashGame.updateMany({
  //         game_id: game.game_id,
  //         game_type: "Red"
  //       }, {
  //         user_status: false,
  //         cashout: 0,
  //         profit: 0,
  //         has_won: false,
  //       })
  //       // this.broadcast("crash-all-redball-users", "is-crash")
  //     }
  //   })

  //   // ==================================================== Green Trendball section =============================================================== 
  //   // Get player's wallet
  //   const GetGreentrendWallet = (async (event, game_id) => {
  //     let current_amount;
  //     if (event.token === "PPF") {
  //       let skjk = await PPFWallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 2
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await PPFWallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     if (event.token === "USDT") {
  //       let skjk = await USDT_wallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 2
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await USDT_wallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     //  this.broadcast("redball_update_wallet", {update_bal:current_amount, ...event})

  //     await CrashGame.updateOne({
  //       user_id: event.user_id,
  //       game_id: game_id,
  //       game_type: "Green"
  //     }, {
  //       game_status: false,
  //       user_status: false,
  //       cashout: 2,
  //       profit: parseFloat(event.bet_amount) * 2,
  //       payout: 2,
  //       has_won: true
  //     })
  //     // this.broadcast("crash-all-redball-users", "is-crash")
  //   })

  //   //================== update payout and crash hash ===========================
  //   const handleGreenTrendballEl = (async (game) => {
  //     await CrashGame.updateMany({
  //       user_status: false,
  //       game_id: game.game_id,
  //       game_type: "Green"
  //     }, {
  //       game_status: false,
  //       payout: game.crashpoint,
  //       game_hash: game.hash
  //     })
  //   })

  //   //  ====== Green trend ball lost ============
  //   const handleGreenTrendball = (async (game) => {
  //     await CrashGame.updateMany({
  //       game_id: game.game_id,
  //       game_type: "Green"
  //     }, {
  //       user_status: false,
  //       cashout: 0,
  //       profit: 0,
  //       has_won: false
  //     })
  //   })

  //   // Notify winning update
  //   const handleGreentrendballCashout = (async (game_id) => {
  //     let data = await CrashGame.find({ game_id: game_id, game_type: "Green" })
  //     for (let i = 0; i < data.length; i++) {
  //       GetGreentrendWallet(data[i], game_id)
  //       // this.broadcast("crash-all-greenball-users", "has_win")
  //     }
  //   })

  //   // ==================================================== Moon Trendball section =============================================================== 

  //   // Get player's wallet
  //   const GetMoontrendWallet = (async (event, game_id) => {
  //     let current_amount;
  //     if (event.token === "PPF") {
  //       let skjk = await PPFWallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 10
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await PPFWallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     if (event.token === "USDT") {
  //       let skjk = await USDT_wallet.find({ user_id: event.user_id })
  //       let win_amount = parseFloat(event.bet_amount) * 10
  //       current_amount = parseFloat(parseFloat(skjk[0].balance) + win_amount).toFixed(4)
  //       await USDT_wallet.updateOne({ user_id: event.user_id }, { balance: current_amount });
  //     }

  //     //  this.broadcast("redball_update_wallet", {update_bal:current_amount, ...event})

  //     await CrashGame.updateOne({
  //       user_id: event.user_id,
  //       game_id: game_id,
  //       game_type: "Moon"
  //     }, {
  //       game_status: false,
  //       user_status: false,
  //       cashout: 2,
  //       profit: parseFloat(event.bet_amount) * 10,
  //       payout: 2,
  //       has_won: true
  //     })
  //     // this.broadcast("crash-all-moonball-users", "is-crash")
  //   })

  //   // Notify winning update
  //   const handleMoontrendballCashout = (async (game_id) => {
  //     let data = await CrashGame.find({ game_id: game_id, game_type: "Moon" })
  //     for (let i = 0; i < data.length; i++) {
  //       GetMoontrendWallet(data[i], game_id)
  //       // this.broadcast("crash-all-moonball-users", "has_win")
  //     }
  //   })

  //   //  ====== Moon trend ball lost ============
  //   const handleMoonTrendball = (async (game) => {
  //     await CrashGame.updateMany({
  //       game_id: game.game_id,
  //       game_type: "Moon"
  //     }, {
  //       user_status: false,
  //       cashout: 0,
  //       profit: 0,
  //       has_won: false
  //     })
  //     // this.broadcast("crash-all-moonball-users", "is-crash")
  //   })

    HandlecrashCurve(event){
      let count = 0
      this.crashCurve = setInterval(() => {
        if (count < 590) {
          count += 0.94
        } else {
          count = 586.6
        }
        this.broadcast("nuppp-curve", count.toFixed(2))
      }, 5)
    }
  //   let v_default = 0;
  //   let v_two = 0
  //   const handle_V_two = ((speed, action) => {
  //     v_two += speed
  //     // if(action){
  //     //     this.broadcast("v_two", v_two)
  //     // }else{
  //     //     this.broadcast("v_two", action)
  //     //     v_two = 0
  //     // }
  //     // this.broadcast("v_default", false)
  //   })

  //   let v_three = 0
  //   const handle_V_three = ((speed, action) => {
  //     v_three += speed
  //     if (action) {
  //       // this.broadcast("v_three", v_three)
  //     } else {
  //       // this.broadcast("v_three", action)
  //       v_three = 0
  //     }
  //   })


  //   let v_five = 0
  //   const handle_V_Five = ((speed, action) => {
  //     v_five += speed
  //     if (action) {
  //       // this.broadcast("v_five", v_five)
  //     } else {
  //       v_five = 0
  //       // this.broadcast("v_five", action)
  //     }
  //   })


  //   let v_seven = 0
  //   const handle_V_Seven = ((speed, action) => {
  //     v_seven += speed
  //     // if(action){
  //     //     this.broadcast("v_seven", v_seven)
  //     // }else{
  //     //     v_seven = 0
  //     //     this.broadcast("v_seven", action)
  //     // }
  //   })

  //   let v_nine = 0
  //   const handle_V_Nine = ((speed, action) => {
  //     v_nine += speed
  //     // if(action){
  //     //     this.broadcast("v_nine", v_nine)
  //     // }else{
  //     //     v_nine = 0
  //     //     this.broadcast("v_nine", action)
  //     // }
  //   })


  //   let v_ten = 0
  //   const handle_V_Ten = ((speed, action) => {
  //     v_ten += speed
  //     // if(action){
  //     //     this.broadcast("v_ten", v_ten)
  //     // }else{
  //     //     v_ten = 0
  //     //     this.broadcast("v_ten", action)
  //     // }
  //   })

  //   let v_twenty = 0
  //   const handle_V_Twenty = ((speed, action) => {
  //     v_twenty += speed
  //     // if(action){
  //     //     this.broadcast("v_twenty", v_twenty)
  //     // }else{
  //     //     v_twenty = 0
  //     //     this.broadcast("v_twenty", action)
  //     // }
  //   })

  //   let v_fivety = 0
  //   const handle_V_Fivety = ((speed, action) => {
  //     v_fivety += speed
  //     // if(action){
  //     //     this.broadcast("v_fivety", v_fivety)
  //     // }else{
  //     //     v_fivety = 0
  //     //     this.broadcast("v_fivety", action)
  //     // }
  //   })

  //   let v_hundred = 0
  //   const handle_V_Hundred = ((speed, action) => {
  //     v_hundred += speed
  //     // if(action){
  //     //     this.broadcast("v_hundred", v_hundred)
  //     // }else{
  //     //     v_hundred = 0
  //     //     this.broadcast("v_hundred", action)
  //     // }
  //   })


  //   let v_Twohundred = 0
  //   const handle_V_TwoHundred = ((speed, action) => {
  //     v_Twohundred += speed
  //     // if(action){
  //     //     this.broadcast("v_Twohundred", v_Twohundred)
  //     // }else{
  //     //     v_Twohundred = 0
  //     //     this.broadcast("v_Twohundred", action)
  //     // }
  //   })


  //   let v_FiveHundred = 0
  //   const handle_V_FiveHundred = ((speed, action) => {
  //     v_FiveHundred += speed
  //     // if(action){
  //     //     this.broadcast("v_FiveHundred", v_FiveHundred)
  //     // }else{
  //     //     v_FiveHundred = 0
  //     //     this.broadcast("v_FiveHundred", action)
  //     // }
  //   })

  //   let v_thousand = 0
  //   const handle_V_Thousand = ((speed, action) => {
  //     v_thousand += speed
  //     // if(action){
  //     //     this.broadcast("v_thousand", v_thousand)
  //     // }else{
  //     //     v_thousand = 0
  //     //     this.broadcast("v_thousand", action)
  //     // }
  //   })



  //   let h_two = 18
  //   const handle_H_Two = ((speed, action) => {
  //     h_two -= speed
  //     // if(action){
  //     //     this.broadcast("h_two", h_two)
  //     // }else{
  //     //     h_two = 18
  //     //     this.broadcast("h_two", action)
  //     // }
  //   })

  //   let h_four = 38
  //   const handle_H_Four = ((speed, action) => {
  //     h_four -= speed
  //     // if(action){
  //     //     this.broadcast("h_four", h_four)
  //     // }else{
  //     //     h_four = 38
  //     //     this.broadcast("h_four", action)
  //     // }
  //   })


  //   let h_six = 58
  //   const handle_H_Six = ((speed, action) => {
  //     h_six -= speed
  //     // if(action){
  //     //     this.broadcast("h_six", h_six)
  //     // }else{
  //     //     h_six = 58
  //     //     this.broadcast("h_six", action)
  //     // }
  //   })

  //   let h_eight = 78
  //   const handle_H_Eight = ((speed, action) => {
  //     h_eight -= speed
  //     // if(action){
  //     //     this.broadcast("h_eight", h_eight)
  //     // }else{
  //     //     h_eight = 78
  //     //     this.broadcast("h_eight", action)
  //     // }
  //   })

  //   let h_ten = 100
  //   const handle_H_Ten = ((speed, action) => {
  //     // h_ten -= speed
  //     // if(action){
  //     //     this.broadcast("h_ten", h_ten)
  //     // }else{
  //     //     h_ten = 100
  //     //     this.broadcast("h_ten", action)
  //     // }
  //   })

  //   let h_twelve = 100
  //   const handle_H_Twelve = ((speed, action) => {
  //     // h_twelve -= speed
  //     // if(action){
  //     //     this.broadcast("h_twelve", h_twelve)
  //     // }else{
  //     //     h_twelve = 100
  //     //     this.broadcast("h_twelve", action)
  //     // }
  //   })

  //   let h_fourteen = 100
  //   const handle_h_fourteen = ((speed, action) => {
  //     h_fourteen -= speed
  //     // if(action){
  //     //     this.broadcast("h_fourteen", h_fourteen)
  //     // }else{
  //     //     h_fourteen = 100
  //     //     this.broadcast("h_fourteen", action)
  //     // }
  //   })

  //   let h_sixteen = 100
  //   const handle_h_sixteen = ((speed, action) => {
  //     h_sixteen -= speed
  //     // if(action){
  //     //     this.broadcast("h_sixteen", h_sixteen)
  //     // }else{
  //     //     h_sixteen = 100
  //     //     this.broadcast("h_sixteen", action)
  //     // }
  //   })

  //   let h_eighteen = 100
  //   const handle_h_eighteen = ((speed, action) => {
  //     h_eighteen -= speed
  //     // if(action){
  //     //     this.broadcast("h_eighteen", h_eighteen)
  //     // }else{
  //     //     h_eighteen = 100
  //     //     this.broadcast("h_eighteen", action)
  //     // }
  //   })

  //   let h_twenty = 100
  //   const handle_h_twenty = ((speed, action) => {
  //     h_twenty -= speed
  //     // if(action){
  //     //     this.broadcast("h_twenty", h_twenty)
  //     // }else{
  //     //     h_twenty = 100
  //     //     this.broadcast("h_twenty", action)
  //     // }
  //   })

  //   let h_thirthy = 100
  //   const handle_h_thirthy = ((speed, action) => {
  //     h_thirthy -= speed
  //     // if(action){
  //     //     this.broadcast("h_thirthy", h_thirthy)
  //     // }else{
  //     //     h_thirthy = 100
  //     //     this.broadcast("h_thirthy", action)
  //     // }
  //   })

  //   let h_fourty = 100
  //   const handle_h_fourty = ((speed, action) => {
  //     h_fourty -= speed
  //     // if(action){
  //     //     this.broadcast("h_fourty", h_fourty)
  //     // }else{
  //     //     h_fourty = 100
  //     //     this.broadcast("h_fourty", action)
  //     // }
  //   })



  //   let h_sixty = 100
  //   const handle_h_sixty = ((speed, action) => {
  //     h_sixty -= speed
  //     // if(action){
  //     //     this.broadcast("h_sixty", h_sixty)
  //     // }else{
  //     //     h_sixty = 100
  //     //     this.broadcast("h_sixty", action)
  //     // }
  //   })

  //   let h_eighty = 100
  //   const handle_h_eighty = ((speed, action) => {
  //     h_eighty -= speed
  //     // if(action){
  //     //     this.broadcast("h_eighty", h_eighty)
  //     // }else{
  //     //     this.broadcast("h_eighty", action)
  //     // }
  //   })


  //   let h_hundred = 100
  //   const handle_h_hundred = ((speed, action) => {
  //     // h_hundred -= speed
  //     // if(action){
  //     //     this.broadcast("h_hundred", h_hundred)
  //     // }else{
  //     //     this.broadcast("h_hundred", action)
  //     // }
  //   })


    // //  =================================== All game crash handler ===================================

    handleCrashed(crash_point){
      let data = { game_id: crash_point.game_id, game_hash: crash_point.hash, crash_point: crash_point.crashpoint}
      this.broadcast("crash-details", data)
      // handleCrashHistory(crash_point)
      // handleGameCrash(crash_point)
      // handleRedTrendballEl(crash_point)
      // handleGreenTrendballEl(crash_point)
      // handleMoonTrendballEl(crash_point)
      // auto = []
      // v_five = 0
      // v_default = 0
      // v_two = 0
      // v_three = 0
      // v_seven = 0
      // v_nine = 0
      // v_twenty = 0
      // v_ten = 0
      // v_hundred = 0
      // v_FiveHundred = 0
      // v_thousand = 0
      // v_fivety = 0
      // v_Twohundred = 0

      // h_hundred = 100
      // h_eighty = 100
      // h_sixty = 100
      // h_thirthy = 100
      // h_fourty = 100
      // h_twenty = 100
      // h_eighteen = 100
      // h_sixteen = 100
      // h_fourteen = 100
      // h_ten = 100
      // h_twelve = 100
      // h_eight = 78
      // h_four = 38
      // h_six = 58
      // h_two = 18
    }

  //   // ====================== initialize the game countdown ============================
  //   let result = await fetchHashseed()
  //   if (result) {
  //     HandleCountDown(5)
  //   }

    // ================================================ Game logic =======================================

    HandleMultiplier(point){
      let crash_point = point
      let multiplierEL = 1
      let speed = 0.01
      let trigger = 1
      let triggerEk = 1
      game.HandlecrashCurve(34)
      this.multiplier = setInterval(async () => {
        if (multiplierEL >= crash_point.crashpoint) {
          clearInterval(this.multiplier);
          if (multiplierEL.toFixed(2) < 2) {
            // handleRedtrendballCashout(crash_point.game_id)
            // handleGreenTrendball(crash_point)
          } else if (multiplierEL.toFixed(2) < 10) {
            // handleMoonTrendball(crash_point)
          }
          game.handleCrashed(crash_point)
          speed = 0.01
          clearInterval(this.crashCurve)
          setTimeout(() => {
            game.startCountDown(5);
            this.load_animate = 100
          }, 3000);
        }
        else {
          // fetch_activePlayers(crash_point.game_id)
          // handleAuto_cashout(multiplierEL.toFixed(2), crash_point.game_id)
          if (multiplierEL.toFixed(2) > 1.98 && multiplierEL.toFixed(2) < 2.99) {
            speed = 0.011
            // handle_V_two(0.8, 1)
            // handleRedTrendball(crash_point)
            const called = (() => {
              if (trigger) {
                // handleGreentrendballCashout(crash_point.game_id)
                trigger = 0
              }
            })
            called()
            if (multiplierEL.toFixed(2) > 2.36 && multiplierEL.toFixed(2) < 2.76) {
              // handle_H_Twelve(1.2, 1)
              // handle_H_Four(0.36, 1)
              // handle_H_Ten(0.9, 1)
              // handle_H_Two(0.167, 1)
              // handle_H_Six(0.6, 1)
              // handle_H_Eight(0.8, 1)
            }
            else if (multiplierEL.toFixed(2) > 2.76) {
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
          }

          else if (multiplierEL.toFixed(2) > 2.99 && multiplierEL.toFixed(2) < 4.99) {
            speed = 0.021
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
            }
            else {
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
          }

          else if (multiplierEL.toFixed(2) > 4.99 && multiplierEL.toFixed(2) < 6.99) {
            speed = 0.031
            // handle_V_three(0.4, 1)
            // handle_V_Five(0.73, 1)
            if (multiplierEL.toFixed(2) > 6.2 && multiplierEL.toFixed(2) < 5.5) {
              // handle_h_twenty(0.3, 1)
              // handle_H_Ten(0.2, 1)
            }
            else if (multiplierEL.toFixed(2) > 5.5) {
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
          }
          else if (multiplierEL.toFixed(2) > 6.99 && multiplierEL.toFixed(2) < 9.99) {
            speed = 0.0481
            if (multiplierEL.toFixed(2) > 9) {
              // handle_V_Nine(0.6, 1)
            }
            // handle_V_three(0.16, 1)
            // handle_V_Five(0.3, 1)
            // handle_V_Seven(0.7, 1)
            // handle_h_twenty(0.3, 1)
            // handle_H_Ten(0.3, 1)
          }
          else if (multiplierEL.toFixed(2) > 9.99 && multiplierEL.toFixed(2) < 14.99) {
            speed = 0.07232
            // handle_V_three(0.16, 0)
            // handle_V_Five(0.3, 0)
            // handle_V_Seven(0.7, 0)
            // handle_V_Ten(0.6, 1)
            // handle_V_Nine(0.6, 0)
            const called = (() => {
              if (triggerEk) {
                // handleMoontrendballCashout(crash_point.game_id)
                triggerEk = 0
              }
            })
            // called()

            // handle_H_Ten(0.3, 0)
            // handle_h_twenty(0.3, 1)
          }
          else if (multiplierEL.toFixed(2) > 14.99 && multiplierEL.toFixed(2) < 19.99) {
            speed = 0.08723
            // handle_V_Ten(0.6, 1)
            // handle_h_thirthy(0.3, 1)
            // handle_h_twenty(0.3, 1)
          }
          else if (multiplierEL.toFixed(2) > 19.99 && multiplierEL.toFixed(2) < 50.99) {
            speed = 0.1256
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


          }
          else if (multiplierEL.toFixed(2) > 50.99 && multiplierEL.toFixed(2) < 100.99) {
            speed = 0.131
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
          }
          else if (multiplierEL.toFixed(2) > 100.99 && multiplierEL.toFixed(2) < 200) {
            speed = 0.21236
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
            speed = 0.31236
            if (multiplierEL.toFixed(2) > 250.99) {
              // handle_h_fourty(0.01, 0)
              // handle_V_TwoHundred(0.07, 1)
            } else {
              // handle_h_fourty(0.01, 0.04)
              // handle_V_TwoHundred(0.13, 1)
            }
          }
          if (multiplierEL.toFixed(2) > 500 && multiplierEL.toFixed(2) < 1000) {
            speed = 0.41206
            // handle_h_sixty(0.06, 1)
            // handle_V_TwoHundred(0.17, 0)
            // handle_V_FiveHundred(0.07, 1)
          }
          if (multiplierEL.toFixed(2) > 1000) {
            speed = 0.51312
            // handle_V_FiveHundred(0.05, 0)
            // handle_V_Thousand(0.05, 1)
          }
          this.broadcast("running-crash", multiplierEL.toFixed(2))
        }
        multiplierEL += speed;
      }, 90);
    }


  broadcast(event, data) {
    if (!this.clients.length) return;
    this.clients.forEach(client => {
      client.event.emit(event, data);
    });
  }

  registerEvents(req, res) {
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      event: new SSE(res)
    };
    this.clients.push(newClient);
    req.on('close', () => {
      console.log(`${clientId} Connection closed`);
      this.clients = this.clients.filter(client => client.id !== clientId);
    });
  }

  stop() {
    if (this.multiplier) clearInterval(this.multiplier);
    if (this.timeLoop) clearInterval(this.timeLoop);
    if (this.crashCurve) clearInterval(this.crashCurve);
    if (this.countDown) clearInterval(this.countDown);
  }

 async fetchHashes(){
    try {
      const crashes = await CrashHash.find()
      crashes.forEach(element => {
        this.hashList.push(element)
      })
      if(crashes){
        game.startCountDown(5);
      }
      return crashes
    }
    catch (error) {
      console.log("There no crash hash or Network issues")
    }
  }

  startCountDown(e) {
    this.counter = 1;
    let ty = this.hashList[this.hashList.length - is_consumed]
    let detail = crashPointFromHash(ty)
    is_consumed += 1
      let timeSec = e
      this.timeLoop = setInterval(() => {
        if (timeSec.toFixed(2) <= 0.1) {
          clearInterval(this.timeLoop);
          game.HandleMultiplier(detail)
          // this.broadcast("countdown", 0)
        } else {
          // fetch_activePlayers(detail.game_id)
          timeSec -= 0.01;
          this.load_animate -= 0.198;
          let pis = {timeSec,load_animate :this.load_animate  }
          this.broadcast("countdown", pis)
          // this.broadcast("load-animation", load_animate)
          // this.broadcast("game_id", detail.game_id)
        }
      }, 10);
      // this.countDown = setInterval(() => {
      //   this.broadcast("countdown-test", this.counter++);
      //   if (this.counter > 10000000) clearInterval(this.countDown);
      // }, 10);
      
  }

}


const game = new CrashGameEngine();
sseApp.get('/events', (req, res) => {
  game.registerEvents(req, res);
});

// game.start();
// game.startCountDown(5);
game.fetchHashes();
module.exports = sseApp