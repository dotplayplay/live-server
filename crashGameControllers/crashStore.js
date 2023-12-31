const Crash_history = require("../model/crash-game-history")
const crash_game = require("../model/crashgame")

// Store crash_ history after it crash
const handleCrashHistory = (async(e)=>{
    let data = {hash: e.hash, game_id:e.game_id, crash_point: e.crash_point}
   let result = await Crash_history.create(data)
   return result
})

const handleUpdateHash = (async(event)=>{
   await crash_game.updateMany({ game_id: event.game_id }, {
    game_hash: event.hash,
    game_status: false,
   });
})


const handleGameCrash = (async(event)=>{
handleUpdateHash(event)
   await crash_game.updateMany({ game_type: "Classic", user_status: true }, {
      has_won: false,
      user_status: false,
      cashout: 0,
      profit: 0
     });

     await crash_game.updateMany({ game_type: "Classic", game_id: event.game_id }, {
      game_hash: event.hash,
      payout: event.crash_point,
      game_status: false,
     });
})


//================== update payout and crash hash ===========================
const handleMoonTrendballEl = (async(game)=>{
  await crash_game.updateMany({ game_type: "Moon", game_id: game.game_id }, {
    payout: game.crash_point,
    game_hash: game.hash,
    game_status: false,
   });
})

    //================== update payout and crash hash ===========================
    const handleRedTrendballEl = (async (game) => {
      await crash_game.updateMany({
        game_id: game.game_id,
        game_type: "Red"
      }, {
        game_status: false,
        payout: game.crash_point,
        game_hash: game.hash
      })
    })

module.exports = { handleCrashHistory,handleGameCrash ,handleRedTrendballEl, handleMoonTrendballEl}