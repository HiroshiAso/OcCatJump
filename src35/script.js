const matome = {
  JUMP_POWER: 8, // 🕴数字が大きいほど、ジャンプが高くなる
  GRAVITY: 0.8, // 🌙数字が小さいほど、重力が弱くなる
  MOVE_SPEED: 8, // 🏃数字が大きいほど、ネコが速くなる

  NEZUMI_FREQ: 50, // 🐭数字が小さいほど、ネズミがたくさん出てくる
  NEZUMI_SPEED: 5, // 🐭数字が大きいほど、ネズミのスピードが速くなる

  SAKANA_FREQ: 30, // 🐟数字が小さいほど、サカナがたくさん出てくる
  SAKANA_SPEED: 8, // 🐟数字が大きいほど、サカナのスピードが速くなる

  ON_TIMER: false, // ⏰タイマーを有効化したい場合は「true」　★Step3
  TIMER: 10, // ⏰タイマーが有効である場合、タイマーの時間をセット(秒単位)

  SOUND: true, // 🎵音を出さない場合は「false」
  PLAYER_ICON: "neko", // 🐕"inu"でイヌ、🐍"hebi"でヘビに変更できる(元は"neko")
};

// 🏆ゲームクリア条件🏆 //
const gameclear = (sakana, nezumi) => {
  // ゲームクリア条件をプログラムする場所　★Step2




};

// 🥺ゲームオーバー条件🥺 //
const gameover = (sakana, nezumi) => {
  // ゲームオーバー条件をプログラムする場所　★Step2




};

// ⏰時間切れの時の条件⏰ //
const timeover = (sakana, nezumi) => {
  // 時間切れの時の条件をプログラムする場所　★Step3




};

// 🎮プレイヤーの移動処理🎮 //
const movePlayer = (player, keys) => {
  if (keys.left) {
    // 左に移動　★Step1


    player.direction = 1;
  }
  if (keys.right) {
    // 右に移動　★Step1


    player.direction = -1;
  }
  // 画面端の制限
  player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
};
