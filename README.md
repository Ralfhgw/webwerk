##### Restart nginx nach Änderungen:
~~~
sudo certbot certonly --webroot -w /var/www/certbot -d app.webwerk.pro
sudo certbot certonly --webroot -w /var/www/certbot -d webwerk.pro
sudo vi /etc/nginx/sites-available/webwerk
sudo nginx -t
sudo systemctl restart nginx
~~~

##### Prüfung EMail Service 
~~~
sudo systemctl daemon-reload
sudo systemctl enable --now webwerk-contact
sudo systemctl status webwerk-contact
curl http://127.0.0.1:8787/api/health
sudo nginx -t
sudo systemctl reload nginx
~~~

##### Prüfen des EMail Prozesses
~~~
sudo systemctl status webwerk-contact
sudo journalctl -u webwerk-contact -n 50 --no-pager
sudo journalctl -u webwerk-contact -f
~~~

##### Setzen der Werbservice Rechte
~~~
sudo chown -R deploy:deploy /var/www/webwerk
find /var/www/webwerk -type d -exec chmod 755 {} \;
find /var/www/webwerk -type f -exec chmod 644 {} \;
npm run build
~~~

##### Eingehende E-Mails für Ralf.Neumann@webwerk.pro
~~~
1. In Resend die Domain webwerk.pro öffnen und Receiving aktivieren.
2. Den von Resend angezeigten MX-Record bei deinem DNS-Provider setzen.
3. In Resend einen Webhook für email.received auf https://webwerk.pro/api/resend/webhook anlegen.
4. Das signing_secret des Webhooks als RESEND_WEBHOOK_SECRET in /opt/webwerk-contact-service/.env.contact-service.local eintragen.
5. INBOUND_ALLOWED_TO_EMAILS=Ralf.Neumann@webwerk.pro und das Zielpostfach in INBOUND_FORWARD_TO_EMAILS setzen.
6. Service neu starten und einen externen Test an Ralf.Neumann@webwerk.pro senden.
~~~

##### Wichtiger Hinweis zu MX-Records
~~~
Wenn webwerk.pro bereits bestehende MX-Records für ein anderes Mail-System hat, darfst du Resend nicht einfach parallel mit gleicher Priorität auf derselben Domain eintragen.
Dann entweder:
- die Domain komplett auf Resend-Empfang umstellen, oder
- ein separates Postfach oder Alias beim bisherigen Mail-Provider anlegen.
~~~
