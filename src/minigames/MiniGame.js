import { ItemType } from '../entity/items';
import KeyBinding from '../util/KeyBinding';
import { Difficulty } from '../globals';

/**
 * Base class for all mini games
 */
export default class MiniGame extends Phaser.Scene {
  /**
   * Creates a mini game within the current scene
   * @constructor
   * @param {string} key - The scene key
   */
  constructor( key ) {
    super( { key: key } );
    
    /**
     * The scene key
     * @type {string}
     */
    this.key = key;
    
    /**
     * The name of the minigame
     * @type {string}
     */
    this.name = 'Default MiniGame';
    
    /**
     * The description of the minigame
     * @type {string}
     */
    this.description = 'Default description';

    /**
     * The text displayed quickly to the user before the minigame begins
     * @type {string}
     */
    this.text = 'Default!';

    /**
     * The time duration of the mini game in ms
     * @type {number}
     */
    this.duration = -1;
    
    /**
     * The amount of time elapsed in ms since the minigame started
     * @type {number}
     */
    this.elapsedTime = 0;
    
    /**
     * Whether or not the minigame has started
     * @type {boolean}
     */
    this.started = false;
    
    /**
     * The horizontal position of the minigame window
     * @type {number}
     */
    this.x = 25;
    
    /**
     * The vertical position of the minigame window
     * @type {number}
     */
    this.y = 25;
    
    /**
     * The difficulty of the minigame
     * @type {Difficulty}
     */
    this.difficulty = Difficulty.EASY;
    
    /**
     * The time scale applied to the duration of the minigame
     * @type {number}
     */
    this.timeScale = 1;
    
    /**
     * The parent scene that created this minigame
     * @type {Phaser.Scene}
     */
    this.parent = null;
    
    /**
     * The width of the game
     * @type {number}
     */
    this.w = -1;
    
    /**
     * The height of the game
     * @type {number}
     */
    this.h = -1;
    
    /**
     * The text graphic displayed to the user quickly before the minigame starts
     * @type {Phaser.GameObjects.Text}
     */
    this.alertText = null;
    
    /**
     * The ID of the timeout used for starting the minigame
     * @type {number}
     */
    this.startTimeout = -1;
    
    /**
     * The graphics bar used to display the amount of time left in the minigame
     * @type {Phaser.GameObjects.Graphics}
     */
    this.timerBar = null;
  }

  /**
   * Initializes data when the mini game is created
   * @param {object} data - information passed from parent scene
   */
  create( data ) {
    this.parent = data.parent;
    this.difficulty = data.difficulty;
    this.w = this.sys.game.config.width;
    this.h = this.sys.game.config.height;

    const background = this.add.graphics();
    background.fillStyle( 0x999999, 1 );
    background.fillRect( this.x, this.y, this.w - 50, this.h - 50 );

    this.add.text( this.x + 16, this.y + 16, this.name,
      {
        fontSize: '24px',
        fill: '#FFF'
      } );
    this.add.text( this.x + 16, this.y + 40, this.description,
      {
        fontSize: '12px',
        fill: '#FFF'
      } );

    this.alertText = this.add.text( this.w / 2, this.h / 2, this.text,
      {
        fontSize: '40px',
        fill: '#FFF'
      } );
    this.alertText.setPosition(
      this.alertText.x - this.alertText.width / 2,
      this.alertText.y - this.alertText.height / 2
    );

    // Show text for 1 second, then start mini game
    this.startTimeout = setTimeout( () => {
      this.startGame();
    }, 1000 );

    this.timerBar = this.add.graphics();
    this.timerBar.fillStyle( 0xFFFFFF, 0.4 );
    this.timerBar.fillRect( this.x, this.h - 10 - this.y, this.w - 50, 10 );

    /**
     * Object used to store the keys available for use in the minigame
     * @type {Object}
     */
    this.keys = KeyBinding.createKeys( this, [ 'interact' ] );
  }

  /**
   * Updates every tick of the game loop
   * @param {number} time The current time
   * @param {number} delta The delta time in ms since the last frame
   */
  update( time, delta ) {
    if ( this.started ) {
      if ( this.duration !== -1 ) {
        if ( this.elapsedTime > this.duration ) {
          this.lose();
        }
        this.elapsedTime += delta * this.timeScale;

        this.timerBar.clear();
        this.timerBar.fillStyle( 0xFFFFFF, 0.4 );
        this.timerBar.fillRect( this.x,
          this.h - 10 - this.y,
          this.w - ( ( this.w - 50 ) * ( this.elapsedTime / this.duration ) )
          - 50,
          10
        );
      }
      this.updateMiniGame( time, delta );
    }
    else if ( this.keys.interact.isDown ) {
      this.openInventory();
    }
  }

  /**
   * Opens the inventory
   */
  openInventory() {
    clearTimeout( this.startTimeout );
    this.input.keyboard.resetKeys();
    this.scene
      .launch( 'InventoryScene', {
        parent: this,
        inventory: this.parent.scene.player.inventory,
        context: ItemType.MINIGAME
      } )
      .bringToTop( 'InventoryScene' )
      .pause();
  }

  /**
   * Closes the inventory
   * @param {Item} item The item selected from the inventory
   */
  closeInventory( item ) {
    this.scene.stop( 'InventoryScene' );
    this.input.keyboard.resetKeys();
    this.scene.resume();

    if ( item && item.itemType === ItemType.MINIGAME ) {
      item.use( { minigame: this } );
      this.parent.scene.player.inventory.items.splice( item.inventoryIndex, 1 );
      this.startGame();
    }
    else {
      this.startTimeout = setTimeout( () => {
        this.startGame();
      }, 1000 );
    }
  }

  /**
   * Called right before the mini game starts
   */
  startGame() {
    this.alertText.destroy();
    this.started = true;
  }

  /**
   * This method will only be updated once the mini game has officially started.
   * The mini game will start after the alert text disappears.
   * @param {number} time The current time
   * @param {number} delta The delta time in ms since the last frame
   */
  updateMiniGame( time, delta ) {
    // NOTE: Override this in mini game classes
    throw new Error( 'updateMiniGame() must be overriden' );
  }

  /**
   * Called when the mini game has been won. Will redirect back to combat.
   */
  win() {
    const timeLeft = this.duration - this.elapsedTime;

    this.reset();
    this.parent.continueCombat( {
      win: true,
      damage: Math.ceil( timeLeft / 1000 ) * this.difficulty
    } );
  }

  /**
   * Called when the mini game has been lost. Will redirect back to combat.
   */
  lose() {
    this.reset();
    this.parent.continueCombat( {
      win: false,
      damage: 0
    } );
  }

  /**
   * Resets the mini game to its original state to be played again.
   */
  reset() {
    this.timerBar.destroy();
    this.elapsedTime = 0;
    this.started = false;
    this.timeScale = 1;
  }
}