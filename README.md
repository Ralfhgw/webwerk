##### Restart nginx nach Änderungen:
```
sudo certbot certonly --webroot -w /var/www/certbot -d app.webwerk.pro
sudo certbot certonly --webroot -w /var/www/certbot -d webwerk.pro
sudo vi /etc/nginx/sites-available/webwerk
sudo nginx -t
sudo systemctl restart nginx
```

##### Prüfung EMail Service 
```
sudo systemctl daemon-reload
sudo systemctl enable --now webwerk-contact
sudo systemctl status webwerk-contact
curl http://127.0.0.1:8787/api/health
sudo nginx -t
sudo systemctl reload nginx
```

##### Prüfen des EMail Prozesses
```
sudo systemctl status webwerk-contact
sudo journalctl -u webwerk-contact -n 50 --no-pager
sudo journalctl -u webwerk-contact -f
```

##### Setzen der Werbservice Rechte
```
sudo chown -R deploy:deploy /var/www/webwerk
find /var/www/webwerk -type d -exec chmod 755 {} \;
find /var/www/webwerk -type f -exec chmod 644 {} \;
npm run build
```