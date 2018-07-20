# teknopar-grafana
I will tell what and how did I create Grafana plugin and dashboard, and modify Grafana source code.

## influxdb
Download [influxdb and chronograf](https://portal.influxdata.com/downloads). Run influxd and chronograf. chronograf is the server you can administer influxdb. chronograf works on localhost:8888 and influxdb works on localhost:8086 by default. You go chronograf and bind influxdb. Now you can create databases. You can use query templates. I named my database to "db_test". You can read and write data to database. You can write data manually using chronograf or influx cli. In chronograf just press write data. For cli run influx and you can [insert data](https://docs.influxdata.com/influxdb/v1.6/introduction/getting-started/#writing-and-exploring-data). Or you can use other ways to write data. I used node.js.

## node.js [(node.js tutorial)](https://www.youtube.com/playlist?list=PL4cUxeGkcC9gcy9lrvMJ75z9maRw4byYp)
Download [influxdb package](https://www.npmjs.com/package/influx). You can look at its [documentation](https://node-influx.github.io/class/src/index.js~InfluxDB.html). I also used [nodemon](https://www.npmjs.com/package/nodemon) which automatically restarts server when you made changes. After you install influx package you can write data to database. You can also look [github](node.js).

```javascript
const Influx = require('influx');

// init database
const influx = new Influx.InfluxDB('http://localhost:8086'); 
// depends on your permission you can also use "const influx = new Influx.InfluxDB('http://admin:admin@localhost:8086');"

setInterval(writeData, 1000); // call function every 1000 miliseconds

function writeData() {
    var randData1 = (Math.random() * 101);
    var randData2 = (Math.random() * 41 - 20);
    var randData3 = (Math.random() * 501);
    var randData4 = randIn1 * randIn2;

    var randStat = Math.floor(Math.random() * 3);

    var stat = "";

   // random string data
    switch (randStat) {
        case 0:
            stat = "Ok";
            break;
        case 1:
            stat = "Not Ok"
            break;
        default:
            stat = "Maybe?";
    }

    // write points to database
    influx.writePoints([
        {
            measurement: 'data',
            tags: { motor: 'm1' },
            fields: { value: randData1 },
        },
        {
            measurement: 'data',
            tags: { motor: 'm2' },
            fields: { value: randData2,
                      status: stat
            }
        },
        {
            measurement: 'data',
            tags: { motor: 'm3' },
            fields: {
                value: randData3,
                status: stat
            }
        },
        {
            measurement: 'data',
            tags: { motor: 'm4' },
            fields: {
                value: randData4,
                status: stat
            }
        }
    ], {
            database: 'db_test'
        })
        .catch(error => {
            console.error(`Error saving data to InfluxDB! ${error.stack}`)
        });
}

```
You can write data to influxdb with this node.js code. 

## Grafana
You can download [Grafana](https://grafana.com/) or [build from source](#build-from-source). You can look [how to use Grafana](http://docs.grafana.org/guides/getting_started/). You can customize grafana settings with "custom.ini" in location ".../grafana/conf". If you don't have "custom.ini", you can copy "defaults.ini" and rename it "custom.ini". If you want to see finished version of Grafana check [github](grafana).

### Dahboards
Dahboards are the pages you design your. I created [dashboard](grafana/Teknopar%20Industry%204.0%20Platform%20Dashboard-1532069817662.json). You can [import](http://docs.grafana.org/reference/export_import/#importing-a-dashboard) the dashboard. Also you need "tpd4sh.png" image in "grafana/public/img" folder and "Linear Gauge" plugin for this dashboard.

### Plugins
You can download Grafana [plugins](https://grafana.com/plugins) or you can develop your own plugin. See tutorial.

### Build from source
Download grafana source code and dependencies. See [instructions](http://docs.grafana.org/project/building_from_source/). After you download surce code you are ready to change grafana. 

**Note:** Change only template files. Don't forget If you change files built, they will be overrided when you build again.

#### Login Page
We'll start with changing login page.

Grafana Default Login Page:
![Default Login Page](screenshots/img_1.png)
To change background we need a file to replace. I added "login_bg.png" file to ".../grafana/public/img" location. Then we need to go ".../grafana/public/sass/pages/\_login.scss" file. All the login page css information is in this file. Background is defined in login class. 
```css
.login {
...
  background-image: url(../img/heatmap_bg_test.svg);
...
}
```
I changed this url to "../img/login_bg.png". Now reflesh the page and we changed the background.
![Background Changed](screenshots/img_2.png)

Then I changed the position of "login-content". I set "align-items" and "justify-content" to "flex-start". Also I don't want padding so I set "padding" to "0".
```css
.login {
  padding: 0;
...
  align-items: flex-start;
  justify-content: flex-start;
...
}
```
![Position Changed](screenshots/img_3.png)
Now we change "login-content". I deleated "max-width" and "min-height", and added "width: 100%". Then changed "align-items" to "flex-start" and "justify-content" to "space-between". 

```css
...
.login-content {
  width: 100%;
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  position: relative;
  justify-content: space-between;
  z-index: 1;
...
}
```
I also deleted right border and "flex-grow" in below parts to logo be stayed in corner widthout border.
```css
...
@include media-breakpoint-up(sm) {
...
  .login-branding {
    width: 35%;
    padding: 4rem 2rem;
... 
}
@include media-breakpoint-up(md) {
...
  .login-branding {
    width: 45%;
    padding: 2rem 4rem;
    
...
}
```
![Position Changed](screenshots/img_4.png)

We can change logo icon in login.html file. Firs we need an image to show. I added "teknopar_logo.png" file to ".../grafana/public/img" location. Then, go to ".../grafana/public/app/partials/login.html". We change content in "login-branding" div. I added a link to logo and changed image path.
```html
...
   <div class="login-branding">
      <a href="http://teknopar.com.tr/">
        <img class="logo-icon" src="public/img/teknopar_logo.png" alt="Teknopar"/>
      </a>
    </div>
...
```
![Logo Changed](screenshots/img_5.png)
But logo is too small so I changed "logo-icon" style in css file. I set "width" to "100%" and deleted "margin-bottom". Also set "width" to "250" for small screens and "300" for medium screens. You can experiment with values.
```css
 ...
 .logo-icon {
    width: 100%;
  }
...
  
@include media-breakpoint-up(sm) {
...
    .logo-icon {
      width: 250px;
    }
...
}
...
   
@include media-breakpoint-up(md) {
...
    .logo-icon {
      width: 300px;
    }
...
```
Then I removed top space from "login-branding". I change "padding-top" to "1rem". Then I deleted "width", "padding" and "border-righ", and added "padding-left: 1rem;". I also deleted I deleted "width" and "padding" for medium screens.

```css
...
.login-branding {
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 0;
  padding-top: 1rem;
...
@include media-breakpoint-up(sm) {
...
  .login-branding {
    padding-left: 1rem;
...
@include media-breakpoint-up(md) {
...
  .login-branding {
...
```

![Logo Size Changed](screenshots/img_6.png)
Now it looks nice but there ara still problems. We need to separate logo from background so I added a div and styled it in login.html. You can play with color and opacity.
```html
<div class="login container">
  <div class="login-content">
    <div style="position: absolute; width: 100%; height: 100%; background-color: white; opacity: 1; z-index: -1;"></div>
    <div class="login-branding">
...
```
![Background Changed](screenshots/img_7.png)
But now login forms don't look nice. I changed "align-items" to "flex-start", and added "width: 100%;" to "login-outer-box" and "login-inner-box". Alse set "padding" to "1rem" and deleted "max-width" in "login-inner-box".
```css
...
.login-form-group {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: flex-start;
  margin-bottom: 1rem;
...
.login-outer-box {
  display: flex;
  overflow-y: hidden;
  width: 100%;
}

.login-inner-box {
  width: 100%;
  text-align: center;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  transform: tranlate(0px, 0px);
  transition: 0.25s ease;
}
...
```
Then I added width for "login-form" and "login-outer-box" and flex direction for "login-form-group" for small screens. I also deleted padding for small and medium screens.
```css
...
@include media-breakpoint-up(sm) {
...
  .login-form{
    width: auto;
  }
  
  .login-outer-box{
    width: auto;
  }

  .login-form-group{
    flex-direction: row;
  }
  
  .login-inner-box {
    width: 65%;
  }
...
  
@include media-breakpoint-up(md) {
...
  .login-inner-box {
    width: 55%;
  }
...
```
I deleted below part but if you want to keep it, you can keep it. It just changes size of input forms.
```css
...
@include media-breakpoint-up(lg) {
   .login-form-input {
     min-width: 300px;
   }
}
...
```
Time to change button group. I changed "align-item"s and "justify-content" to "flex-start", and deleted "margin-top".
```css
...
.login-button-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
...
```
To change button style I added "btn-submit" to class.
```html
...
          <div class="login-button-group">
            <button type="submit" class="btn-submit btn btn-large p-x-2" ng-click="submit();" ng-class="{'btn-inverse': !loginForm.$valid, 'btn-primary': loginForm.$valid}">
              Log In
            </button>
...
```
Then I added "btn-submit" to css file.
```css
...
.btn-submit{
  min-width: 92px;
  padding: 8px 21px;
}
...
```
Lastly, I changed color of "Forgot your password".
```css
.login {
...
  & a {
    color: #000000 !important;
  }
...
```
Now our login page looks good.
![Login Page Changed](screenshots/img_8.png)

##
Making login page more useful and beautiful. First I remove the background. Then I added html into "login" after "login-content" ends in login.html.
```html
<div class="login container">
...
  <div class="content--wrap">
    <section id="top">
      <div class="parallax">
        <div class="parallax__image-container"></div>
        <div class="parallax__content">
          <div class="top_content">
            <div class="black-cover"></div>
            <h1 class="heading white">
              Factory 4.0 Big Data Analysis Platform for Factories of the Future
            </h1>
            <div class="subheading white">
              Factory 4.0 is a smart data analysis platform for interpreting big data generated by sensors, automation systems and personnel and visualizing predictions for the future.
            </div>
          </div>
        </div>
      </div>
    </section>
    <section id="properties">
      <div class="properties_content">
        <h2 class="heading black">Platform Features</h2>
        <div class="properties_content-cards">
          <div class="card" style="height:auto">
            <div class="card_media" style="background:url(public/img/c_information.6e31b86.jpg)"></div>
            <div class="card_content">
              <div class="heading black">Practical User Intergace and Reporting</div>
              <div class="card_text black">
                Users can quickly access information they want, graphically enhanced interface and comprehensive reporting features provide ease of use.
              </div>
            </div>
          </div>
          <div class="card" style="height:auto">
            <div class="card_media" style="background:url(public/img/c_end.be86cbb.jpg)"></div>
            <div class="card_content">
              <div class="heading black">Fast Integration</div>
              <div class="card_text black">
                  With having a modular structure, platform is compatible with automation technology and it can be easily integrated with any kind of equipment and data source.
              </div>
            </div>
          </div>
          <div class="card" style="height:auto">
            <div class="card_media" style="background:url(public/img/c_data.0073da9.jpg)"></div>
            <div class="card_content">
              <div class="heading black">Scalable Data Analysis Architecture</div>
              <div class="card_text black">
                  Architecture can accommodate growing data sizes and resources that can be installed on facility or in the cloud.
              </div>
            </div>
          </div>
          <div class="card" style="height:auto">
            <div class="card_media" style="background:url(public/img/c_machine.735dbdb.jpg)"></div>
            <div class="card_content">
              <div class="heading black">Data Security</div>
              <div class="card_text black">
                  Communication provides high level of information security with security options that can be adjusted on the basis of users and systems.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
```
Then added css to \_login.scss.
```css
...
.parallax{
  height: 300px;
  position:relative;
  overflow:hidden;
  z-index:0
}
 
.parallax__image-container{
  position:absolute;
  top:0;
  left:0;
  right:0;
  bottom:0;
  background-image: url("../img/login_bg.png");
  min-height: 500px; 
  
  /* Create the parallax scrolling effect */
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;

  opacity: 0.6; // to make It little darker

  transform: translateY(-150px);

  z-index:1;
  contain:strict;
}
  
.parallax__content{
  color:#fff;
  height:100%;
  z-index:2;
  position:relative;
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:0 14px;
  padding:0 1rem
}

.properties_content{
  padding-top: 24px;
  padding-bottom: 24px;
  background-color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.properties_content-cards{
  // max-width: 900px;
  // padding-top: 24px; 
  display: flex;
  justify-content: center;
  flex-direction: row;
  flex-wrap: wrap;
}

.top_content{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.heading{
  font-size: 22px;
  text-align: center;
}

.subheading{
  font-size: 18px;
  text-align: center
}

.white{
  color: white;
}

.black{
  color:black;
}

.card{
  background-color: rgb(255, 255, 255);
  margin: 1rem;
  max-width: 100%;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
  transition: 0.3s;
}

  .card:hover {
    box-shadow: 0 8px 16px 0 rgba(0,0,0,0.6);
  }

.card_media
{
  background-position: center !important;
  background-size: 100% auto !important; 
  background-repeat: no-repeat !important;
  border-radius:inherit;
  position: relative;
  left:0;
  top:0;
  width:100%;
  height:150px
}

.card_content{
  padding: 1rem;
}

.card_text{
  align-items: baseline;
}
...
@include media-breakpoint-up(md) {
  .properties_content-cards{
    flex-wrap: nowrap;
  }

  .card{
    max-width: 20%;
  }

  .applications_content-top{
    max-width: 50%; 
  }
...
```
Lastly, we fix footer. Go to ."../grafana/public/sass/components/\_footer.scss". I deleted "bottom: $spacer;" and its fixed.
```css
...
@include media-breakpoint-up(md) {
  .login-page {
    .footer {
      position: absolute;
      padding: 5rem 0 1rem 0;
    }
  }
}
```
![cards Added](screenshots/img_9.png)

Now you can change everything you want in Grafana. Some important files:
* ".../grafana/public/views/index.template.html" : You can modify head and footer in here.
* ".../grafana/public/app/features/panel/panel_directive.ts" : You can modify panel template in here. (e.g. I deleted loading gif of panel. Below part.)
```html
      <span class="panel-loading" ng-show="ctrl.loading">
        <i class="fa fa-spinner fa-spin"></i>
      </span>
```
* ".../grafana/public/sass/base/\_icons.scss" : You can modify icons in here.
* ".../grafana/public/app/core/components/sidemenu" : You can find sidemenu files in here.

You can search and look other files.
I think best way to find something in source code is first finding in browser page and then search it in files.\
\
If you want to see finished version of Grafana check [github](grafana).
