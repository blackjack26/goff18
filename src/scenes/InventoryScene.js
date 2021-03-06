import KeyBinding from '../util/KeyBinding';
import { itemClass } from '../entity/items';

/**
 * The inventory scene is the scene that displays the inventory to the player.
 */
export default class InventoryScene extends Phaser.Scene {
  /**
   * Initializes the inventory scene
   * @constructor
   */
  constructor() {
    super( { key: 'InventoryScene' } );
    
    /**
     * The horizontal position of the scene
     * @type {number}
     */
    this.x = 25;
    
    /**
     * The vertical position of the scene
     * @type {number}
     */
    this.y = 25;
    
    /**
     * The parent scene used to initiate this scene
     * @type {Phaser.Scene}
     */
    this.parent = null;
    
    /**
     * The inventory to display
     * @type {Inventory}
     */
    this.inventory = null;
    
    /**
     * The item context to help display to the user only the items that can be
     * used at that given time
     * @type {ItemType}
     */
    this.context = null;
  }

  /**
   * Initializes data when the inventory is created
   * @param {object} data - information passed from parent scene
   */
  create( data ) {
    this.parent = data.parent;
    this.inventory = data.inventory;
    this.context = data.context;
    
    /**
     * The width of the game
     * @type {number}
     */
    this.w = this.sys.game.config.width;
    
    /**
     * The height of the game
     * @type {number}
     */
    this.h = this.sys.game.config.height;

    WebFont.load( {
      google: { families: [ 'Rye' ] },
      active: () => {
        const titleText = this.add.text( this.w / 2, 10, 'Inventory', {
          fontSize: '40px',
          color: '#FFF',
          fontFamily: 'Rye'
        } );
        titleText.setShadow( 0, 2, '#333', 10 );
        titleText.setPosition( this.w / 2 - titleText.width / 2,
          titleText.height / 2 + 10 );
      }
    } );

    const background = this.add.graphics();
    background.fillStyle( 0x999999, 1 );
    background.fillRect( this.x, this.y, this.w - 50, this.h - 50 );

    const border = this.add.graphics();
    border.lineStyle( 4, 0x7b654f, 1 );
    border.strokeRect( this.x, this.y, this.w - 50, this.h - 50 );

    /**
     * A collection of keys available for use in the inventory
     * @type {Object}
     */
    this.keys = KeyBinding.createKeys( this,
      [ 'up', 'left', 'right', 'down', 'space', 'interact' ] );

    this.lights.enable().setAmbientColor( 0x111111 );
    this.lights.addLight( this.w / 2, this.h / 2, this.w * 2, 0xFFFFFF, 1 );

    // Normal Items
    this.inventory.items.forEach( ( item, index ) => {
      const Item = itemClass( item );
      const i = new Item( this.x + 40 + index * 64, this.y + 100, this );
      i.inventoryIndex = index;
      i.setScale( 2 );

      if ( i.itemType !== this.context ) {
        i.setAlpha( 0.25 );
      }
      else {
        i.on( 'pointerdown', () => {
          this.parent.closeInventory( i );
        } );
      }
    } );

    // Passive Items
    this.inventory.passive.forEach( ( item, index ) => {
      const Item = itemClass( item );
      const i = new Item( this.x + 40 + index * 64, this.y + 400,
        this );
      i.inventoryIndex = index;
      i.setScale( 2 );
    } );
  }

  /**
   * Updates every tick of the game loop
   * @param {number} time The current time
   * @param {number} delta The delta time in ms since the last frame
   */
  update( time, delta ) {
    if ( this.keys.interact.isDown ) {
      this.parent.closeInventory();
      this.input.keyboard.resetKeys();
    }
  }
}