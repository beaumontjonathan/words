// Module imports
import {Component} from '@angular/core';

// Project imports
import {WordsPage} from '../words/words';
import {SettingsPage} from '../settings/settings';
import {HomePage} from '../home/home';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = HomePage;
  tab2Root = WordsPage;
  tab3Root = SettingsPage;

  constructor() {

  }
}
