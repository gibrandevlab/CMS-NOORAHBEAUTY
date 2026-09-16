import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { inject } from '@vercel/analytics';
import { addIcons } from 'ionicons';
import {
  addOutline,
  alertCircleOutline,
  briefcaseOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  createOutline,
  eyeOffOutline,
  eyeOutline,
  folderOpenOutline,
  informationCircleOutline,
  newspaperOutline,
  pricetagsOutline,
  refreshOutline,
  searchOutline,
  trashOutline,
} from 'ionicons/icons';

import { AppModule } from './app/app.module';

addIcons({
  addOutline,
  alertCircleOutline,
  briefcaseOutline,
  businessOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  chevronForwardOutline,
  closeOutline,
  createOutline,
  eyeOffOutline,
  eyeOutline,
  folderOpenOutline,
  informationCircleOutline,
  newspaperOutline,
  pricetagsOutline,
  refreshOutline,
  searchOutline,
  trashOutline,
});

inject();

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
