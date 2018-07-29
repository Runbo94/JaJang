import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

@Injectable()
export class UserService {

  constructor(private db: AngularFireDatabase) { }

  save(user: firebase.User) { // save the user information to the database
    this.db.object('/users/' + user.uid).update({
      name: user.displayName, // update the username in the database
      email: user.email, // update the user email in the database
      emailVerified: user.emailVerified // update the user email verified in the database
    });
  }
  get(uid: string) { // get the user from the database
    return this.db.object('/users/' + uid).valueChanges();
    // get the values of user from the database
  }

}
