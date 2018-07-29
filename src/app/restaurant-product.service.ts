import { Injectable } from '@angular/core';
import {AngularFireDatabase} from 'angularfire2/database';
import {Product} from './models/product';

@Injectable()
export class RestaurantProductService {
  constructor(private db: AngularFireDatabase) {}
  create(product, restaurantId) {
    // create a new product in a certain restaurant
    return this.db.list('/restaurants/' + restaurantId + '/products/').push(product);
    // push the new product to database
  }
  getAll(restaurantId) {
    // get all products of a certain restaurant
    return this.db.list<Product>('/restaurants/' + restaurantId + '/products/')
      .snapshotChanges().map( products => { // get all products
        return products.map(product => { // map to one product
          const rs: Product = product.payload.val(); // values of product
          rs.key = product.key; // key of product
          return rs; // return the product object
        });
      });
  }
  get(productId, restaurantId) { // get a certain product
    return this.db.object('/restaurants/' + restaurantId + '/products/' + productId)
      .snapshotChanges().map( product => { // get product
        const rs = product.payload.val(); // values of the product
        rs.key = product.key; // key of the product
        return rs; // return a product object
        }
      );
  }
  update(productId, restaurantId, product) {
    // update a certain product
    this.db.object('/restaurants/' + restaurantId + '/products/' + productId).update(product);
    // update the product in the database
  }
  delete(productId, restaurantId) {
    // delete a certain product
    this.db.object('/restaurants/' + restaurantId + '/products/' + productId).remove();
    // remove the product from the database
  }
}
