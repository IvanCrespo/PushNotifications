import { EventEmitter, Injectable } from '@angular/core';

/* Plugins */
import { OneSignal, OSNotification, OSNotificationPayload } from '@awesome-cordova-plugins/onesignal/ngx';
import { Storage } from '@ionic/storage';


@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    /* {
      title: 'Titulo de la push',
      body: 'Este es el body de la push',
      date: new Date()
    } */
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(
    private oneSignal: OneSignal,
    private storage: Storage
  ) {
    this.init();
    this.cargarMensajes();
  }

  async init() {
    await this.storage.create();
  }

  async getMensajes(){
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    this.oneSignal.startInit('bd66d030-0c56-4f69-af33-0f0eb844667b', '559182756418');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
      // do something when notification is received
      console.log('Notificación recibida', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async(noti) => {
      // do something when a notification is opened
      console.log('Notificación abierta', noti);
      await this.notificacionRecibida(noti.notification);
    });

    /* Obtener ID de Suscriptor */
    this.oneSignal.getIds().then(info => {
      this.userId = info.userId;
      console.log(this.userId);
    })

    this.oneSignal.endInit();
  }

  async notificacionRecibida(noti: OSNotification) {
    await this.cargarMensajes();
    const payload = noti.payload;
    const existePush = this.mensajes.find(mensaje => mensaje.notificationID === payload.notificationID);

    if (existePush) {
      return;
    }

    this.mensajes.unshift(payload);
    this.pushListener.emit(payload);
    this.guardarMensajes();
  }

  guardarMensajes() {
    this.storage.set('MensajesPush', this.mensajes);
  }

  async cargarMensajes() {
    /* this.storage.clear(); */
    this.mensajes = await this.storage.get('MensajesPush') || [];
    return this.mensajes;
  }

  async borrarMensajes(){
    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();
  }
}
