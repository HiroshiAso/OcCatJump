const item_se = new Audio("./._/item.mp3");
const obs_se = new Audio("./._/obs.mp3");
const jump_se = new Audio("./._/player.mp3");
const success_se = new Audio("./._/success.mp3");

const seplayer = (valid, name) => {
  if (!valid) {
    return;
  }

  switch (name) {
    case "item":
      item_se.cloneNode().play();
      return;
    case "obs":
      obs_se.cloneNode().play();
      return;
    case "jump":
      jump_se.cloneNode().play();
      return;
    case "success":
      success_se.cloneNode().play();
      return;
  }
};
