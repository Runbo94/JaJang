import { Injectable } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Observable} from 'rxjs/Observable';
import {UserShoppingCart} from './models/user-shopping-cart';
import {Product} from './models/product';
import {ShoppingCart} from './models/shopping-cart';

@Injectable()
export class UserShoppingCartsService {
  constructor(private db: AngularFireDatabase) { }
  /* create user's shopping cart for all restaurants */
  create() {
    return this.db.list('/shopping-carts/')
      .push( {
      lastChangedTime: new Date().getTime() // push the new shopping cart with time
    }); // push to the database
  }

  /* get or create user cart id*/
  private async getOrCreateUserCartId(): Promise<string> {
    const cartId = localStorage.getItem('cartId'); // get the shopping cart id
    if (cartId) { return cartId; } // if the shopping cart exists, return the cart id

    const result = await this.create(); // or create the shopping cart
    localStorage.setItem('cartId', result.key); // store the cart id to the local storage
    return result.key; // return the shopping cart key
  }

  /* get user cart from the database */
  async getUserCart(): Promise<Observable<UserShoppingCart>> {
    const cartId = await this.getOrCreateUserCartId(); // get the shopping cart id
    return this.db.object<UserShoppingCart>('/shopping-carts/' + cartId)
      .snapshotChanges()
      .map(userShoppingCart => {
        if (userShoppingCart.payload.val() !== null) { // if the user shopping cart exists
          return new UserShoppingCart(userShoppingCart.payload.val()); // return the user shopping cart
        } else { // if the user shopping cart does not exist
          return new UserShoppingCart({}); // return an empty user shopping cart
        }
      });
  }
  /* get cart for a certain restaurant*/
  async getCart(restaurantId: string): Promise<Observable<ShoppingCart>> {
    const cartId = await this.getOrCreateUserCartId(); // get the cart id
    return this.db.object('/shopping-carts/' + cartId + '/' + restaurantId)
      .snapshotChanges()
      .map(x => {
        if (x.payload.val() !== null) { // if the shopping cart exists
          return new ShoppingCart(x.payload.val().items, restaurantId); // return the shopping cart
        } else { // if the shopping cart does not exist
          return new ShoppingCart({}, restaurantId); // return an empty shopping cart
        }
      });
  }

  /* get item from a certain cart */
  private getItem(restuarantId: string, cartId: string, productId: string) {
    return this.db.object('/shopping-carts/' + cartId + '/' + restuarantId + '/items/' + productId);
    // get the item from the database
  }

  /* update section: */
  /* add product to the cart */
  async addToCart(restuarantId, product: Product) {
    this.updateItem(restuarantId, product, 1);
  }

  /* remove the product from the cart */
  async removeFromCart(restuarantId, product: Product) {
    this.updateItem(restuarantId, product, -1);
  }

  /* clear a cart for a restaurant */
  async clearCart(restaurantId) {
    const cartId = await this.getOrCreateUserCartId();
    this.db.object('/shopping-carts/' + cartId + '/' + restaurantId).remove();
  }

  /* clear all the carts (user cart) */
  async clearUserCart() {
    const cartId = await this.getOrCreateUserCartId(); // get the shopping cart id
    this.db.object('/shopping-carts/' + cartId).remove(); // remove the shopping cart from database
  }

  private async updateItem(restuarantId: string, product: Product, change: number) {
    const cartId = await this.getOrCreateUserCartId(); // get the cart id
    const item$ = this.getItem(restuarantId, cartId, product.key); // get the item (observable)
    item$.snapshotChanges().take(1).subscribe(item => {
      let quantity = change; // change is +1 or -1
      if ( item.payload.val() !== null) { // if the item exists
        quantity += item.payload.val().quantity; // quantity increase
      }
      if (quantity === 0) { // if the quantity is 0
        item$.remove(); // remove the item from the database
      } else { item$.update({ // update the item in the database
        title: product.title, // update the product title
        imageUrl: product.imageUrl, // update the product image url
        price: product.price, // update the product price
        quantity: quantity // update the product quantity
      }); }
    });
  }
}
