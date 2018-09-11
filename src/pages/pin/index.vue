<template>
  <div class="pin-vue">
    <div class="textFileWrapper">
      <input type="text" id='searchTextField' class="controls searchTextField" placeholder="Search address">
    </div>
    <!-- <div class="taskswitch">
      <img src="../../../../../static/images/bell.png" alt="Task">
    </div> -->
    <div id="pin-map" @dragover.capture="allowDrop" @drop="drop"></div>
    <!-- <div class="request-pannel" draggable="true" v-show="showPannel" ref="requestPannel" @dragstart="returnNull">
      <div class="request-header">
        <h3>Request for Vevue here</h3>
      </div>
      <el-input v-model="requestObj.note" class="request-input" size="medium" placeholder="Describe what you would like to see">
      </el-input>
      <div class="request-opt">
        <div class="request-award">
          <el-tag size="" type="warning" class="reward-note"><img src="../../assets/images/logo_coin_20.png" alt="">
            <span>Reward</span>
          </el-tag>
          <div class="reward-select iconfont" for="request-select">
            <el-select v-model="requestObj.rewardValue" id="request-select" size='small'>
              <el-option v-for="item in rewardRange" :key="item" :value="item" :label="item">{{item}}</el-option>
            </el-select>
          </div>
        </div>
        <el-button v-if="requestObj.requesting" type="primary" disabled size="small">Request</el-button>
        <el-button v-else type="primary" @click="toRequest" size="small">Request</el-button>
      </div>
    </div> -->
    <div class="request-pannel" draggable="true" v-show="showPannel" ref="requestPannel">
      <div class='foldborder line'></div>
      <div class="request-container">
        <div class="request-addressinfo">
          <div class="request-header">
            <h3>Send Request</h3>
          </div>
          <div class="locationcache">
            <i class='el-icon-location-outline'></i>
            <p class='locationnote'>
              {{locationAddressCache || ''}}
            </p>
          </div>
        </div>
        <div class="request-tofill" style='width:100%;'>
          <div class="requestset">
            <div class="setitem">
              <p class='item-head'>Describe</p>
              <p class='item-note'>{{requestObj.note}}</p>
              <i @click='showSwitch.describeDialog = true' class='iconfont icon-pencil'></i>
            </div>
            <div class="setitem">
              <p class='item-head'>
                Who can respond
              </p>
              <p class="item-note">
                {{requestObj.whocan.nickname || ''}}
              </p>
              <i @click='toShowWhocanDialog(true)' class='iconfont icon-pencil'></i>
            </div>
            <div class="setitem request-award">
              <p class='item-head'>
                Bounty
              </p>
              <p class="item-note">
              </p>
              <label class="reward-select iconfont" for="requestReward">
                <select v-model="requestObj.rewardValue" id='requestReward'>
                  <option v-for="item in rewardRange" :key="item" :value="item" :label="item">{{item}}</option>
                </select>
              </label>
            </div>
          </div>
          <div class="request-opt">
            <el-button size='mini' v-if="requestObj.requesting" type="primary" disabled>Request</el-button>
            <el-button size='mini' v-else type="primary" @click="toRequest">Request</el-button>
            <el-button size='mini' @click='toEmptyRequest'>Cancel</el-button>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title='Describe' width="30%" :visible.sync="showSwitch.describeDialog" class='describeDialog' :show-close='false'>
      <el-input v-model="requestSet.note" class="request-input" size="medium" placeholder="Describe what you would like to see">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <el-button size='mini' @click="showSwitch.describeDialog = false; requestSet.note=requestObj.note?requestObj.note:'';">Cancel</el-button>
        <el-button size='mini' type="primary" @click="showSwitch.describeDialog = false; requestObj.note= requestSet.note">OK</el-button>
      </span>
    </el-dialog>
    <el-dialog width="28%" :show-close='false' title='following' :visible.sync="showSwitch.whocanDialog" class='describeDialog'>
      <div class='slot-title' slot="title">
        <div class='whocan-header'>
          <span class="el-dialog__title">Following</span>
          <i class='el-icon-close' @click="toShowWhocanDialog(false)"></i>
        </div>
        <el-input ref='searchinput' size='mini' @input="filterWhoCan" v-model="search.keyword" placeholder="" prefix-icon="el-icon-search">
          <i slot="suffix" class="el-input__icon el-icon-error" v-show="search.keyword.length >0" @click="search.keyword='';search.result = followerLists"></i>
        </el-input>
      </div>
      <div class="follower-vue">
        <div class="followLists">
          <div class="followerList anyone" @click='setWhoCan()'>
            <a>
              <!-- <i class='el-icon-circle-check'></i> -->
              <img src="../../static/images/message_right.png" alt="" :onerror='defaultAvatarLogo'>
            </a>
            <div class='flower-meta'>
              <p class="follower-nickname">Anyone</p>
            </div>
          </div>
          <div @click='setWhoCan(followerList)' v-for="(followerList,index) in search.result" :key="index" class="followerList">
            <!-- :to=" '/user/' + video.yuan.bywho" -->
            <a>
              <img :src="followerList.avatar" alt="" :onerror='defaultAvatarLogo'>
            </a>
            <div class="flower-meta">
              <p class="follower-nickname">{{followerList.nickname}}</p>
              <p class="follower-signature">{{followerList.signature}}</p>
            </div>
          </div>
          <div class="nomore" v-if="showNoMore">
            <i class="iconfont icon-nomore"></i>
            <p>No More</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import docCookies from '../../static/tools/cookies.js';
import totp from '../../static/tools/totp.js';
import SparkMD5 from 'spark-md5';
export default {
  name: 'pin',
  layout: 'headNavigation',
  data() {
    return {
      requestObj: {
        requesting: false,
        note: '',
        rewardValue: 2,
        whocan: {
          nickname: 'Anyone',
          uid: 0
        }
      },
      requestSet: {
        note: '',
        bounty: 2
      },
      search: {
        keyword: '',
        result: []
      },
      defaultAvatarLogo:
        'this.src="' +
        require('../../assets/images/vevue_logo_50x50.png') +
        '"',
      lastValidCenter: '', // 缓存上一次的地图中心点
      locationAddressCache: '',
      showPannel: false,
      clusterClicked: false,
      showSwitch: {
        whocanDialog: false,
        describeDialog: false // 描述请求的dialog 开关
      },
      showNoMore: false,
      rewardRange: [2, 3, 4, 5, 6, 7, 8, 9, 10, 50, 100]
    };
  },
  mounted() {
    (function() {
      if (!docCookies.getItem('safekey')) {
        location.href = '/login?continue=' + encodeURIComponent('/#pin');
      }
    })();
    window.vue = this;
    this.initMap();
    this.loadFollowers();
  },
  beforeRouteLeave(to, from, next) {
    // ...
    this.$destroy(); // 销毁vue组件 目的是为了不缓存页面数据
    next();
  },
  methods: {
    allowDrop(e) {
      // e.preventDefault();
    },
    returnNull(e) {
      e.target.style.opacity = '';
    },
    drop() {},
    toShowWhocanDialog(flag) {
      this.showSwitch.whocanDialog = flag;
    },
    loadFollowers() {
      // 读取关注/关注中的用户
      const that = this;
      this.scrollLock = true; // 触底锁定
      let params = {
        action: 'listoffollow',
        userid: docCookies.getItem('userid') || '-',
        towho: docCookies.getItem('userid'),
        type: 'following',
        cid: docCookies.getItem('cid') || ''
      };
      params.authcode = docCookies.getItem('userid')
        ? totp.getCode(docCookies.getItem('safekey'))
        : '';
      params.timestamp = Math.floor(new Date().getTime() / 1000);
      axios.post(apiUrl.vevueAPI + params.action, params).then(res => {
        if (res.data.errcode === 0) {
          let result = res.data.result;
          if (result.length === 0) {
            that.showNoMore = true;
            return;
          }
          result.map(item => {
            item.avatar = apiUrl.avatarURL + item.avatar + '.jpg';
            item.nickname = item.nickname;
            item.signature = item.signature;
          });
          that.followerLists = result;
          that.search.result = result;
          that.scrollLock = false; // 触底解锁
        } else {
        }
      });
    },
    setWhoCan(item) {
      if (item) {
        this.requestObj.whocan = item;
      } else {
        this.requestObj.whocan = {
          nickname: 'Anyone',
          uid: 0
        };
      }
      this.showSwitch.whocanDialog = false;
    },
    filterWhoCan() {
      if (this.search.keyword.trim()) {
        let resultCache = null;
        resultCache = this.followerLists.filter(item => {
          return item.nickname.indexOf(this.search.keyword) >= 0;
        });
        this.search.result = resultCache;
      } else {
        this.search.result = this.followerLists;
      }
    },
    toRequest() {
      const that = this;
      console.log('to Request!!');
      if (!that.requestObj.note.trim()) {
        that.$message({
          message: 'Please fill in the description',
          type: 'warning'
        });
        return null;
      } else {
        this.requestObj.requesting = true;
        axios
          .post(apiUrl.vevueAPI + 'request', {
            userid: docCookies.getItem('userid') || '-',
            location: this.requestObj.locationParam,
            note: this.requestObj.note,
            targetuid: this.requestObj.whocan.uid,
            amount: this.requestObj.rewardValue,
            unitlock: SparkMD5.hash(
              docCookies.getItem('userid') +
                this.requestObj.note +
                this.requestObj.locationParam
            ),
            authcode: docCookies.getItem('userid')
              ? totp.getCode(docCookies.getItem('safekey'))
              : '',
            cid: docCookies.getItem('cid') || '',
            timestamp: Math.floor(new Date().getTime() / 1000)
          })
          .then(res => {
            this.requestObj.requesting = false;
            if (res.data.errcode === 0) {
              this.$message({
                message: 'Requested successfully',
                duration: 1200,
                type: 'success'
              });
              // this.requestObj;
              let marker = new google.maps.Marker({
                position: {
                  lat: +that.requestObj.locationParam.split(',')[0],
                  lng: +that.requestObj.locationParam.split(',')[1]
                },
                map: that.map,
                // animation: google.maps.Animation.BOUNCE,
                icon: {
                  url: require('../../assets/images/logo_coin_100.png'),
                  scaledSize: new google.maps.Size(20, 20)
                }
              });
              const note = that.requestObj.note;
              marker.addListener('click', function() {
                that.marker.setPosition(null);
                that.showPannel = false;
                that.infowindow.setContent(
                  note +
                    `<br/><p style='font-size:10px; margin:5px; color:#b4b4b4'>Download <a href = "http://app.vevue.com/" style='color:blue;'>Vevue App</a> and upload video to respond to this request</p>`
                );
                that.infowindow.open(that.map, marker);
              });
              this.showPannel = false;
              Object.assign(this.requestObj, {
                note: '',
                locationParam: '',
                rewardValue: 2
              });
              this.requestSet.note = '';
              this.infowindow.close();
              this.marker.setPosition(null);
            } else {
              this.$message.error(res.data.result.message || 'Unknown error.');
            }
          })
          .catch(err => {
            this.requestObj.requesting = false;
            this.$message({
              message: err,
              duration: 1200,
              type: 'error'
            });
          });
      }
    },
    toEmptyRequest() {
      const that = this;
      that.marker.setPosition(null);
      that.infowindow.close();
      that.locationAddressCache = '';
      that.showPannel = false;
      Object.assign(that.requestObj, {
        locationParam: '',
        note: '',
        rewardValue: 2
      });
    },
    async initMap() {
      const that = this;
      const uluru = { lat: 39.83, lng: -101.785 };
      that.map = new google.maps.Map(document.getElementById('pin-map'), {
        zoom: 4,
        center: uluru,
        minZoom: 3,
        // maxZoom: 15,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false
      });
      that.infowindow = new google.maps.InfoWindow({ minWidth: 380 });
      that.geocoder = new google.maps.Geocoder();
      const geocoder = that.geocoder;
      const map = that.map;
      that.marker = new google.maps.Marker({
        map: map,
        icon: {
          url:
            'https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2_hdpi.png',
          scaledSize: new google.maps.Size(20, 30) // scaled size
        }
      });
      that.locationMarker = new google.maps.Marker({
        map: map,
        icon: {
          url: require('../../static/images/location.png'),
          scaledSize: new google.maps.Size(30, 30), // scaled size
          origin: new google.maps.Point(0, 0), // origin
          anchor: new google.maps.Point(0, 0) // anchor
        }
      });
      that.locationPlace(map, that.locationMarker);
      let centerControlDiv = document.createElement('div');
      that.CenterControl(centerControlDiv, that.map);
      centerControlDiv.index = 1;
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        centerControlDiv
      );
      let marker = that.marker;
      // map.addListener('dragstart', function() {
      //   that.mapDraging = true;
      // });
      // map.addListener('dragend', function() {
      //   that.mapDraging = false;
      // });
      google.maps.event.addDomListener(map, 'center_changed', function() {
        clearTimeout(that.timeOutRequest);
        that.checkBounds(map);
      });
      // google.maps.event.addListener(map, 'mousemove', function() {
      //   that.clusterClicked = true;
      // });
      google.maps.event.addListener(
        map,
        'click',
        function(e) {
          clearTimeout(that.timeOutRequest);
          that.timeOutRequest = setTimeout(() => {
            if (that.clusterClicked) {
              that.clusterClicked = false;
              return;
            }
            that.infowindow.close();
            that.geocodeLatLng(
              geocoder,
              null,
              {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              },
              marker
            );
            marker.setPosition(e.latLng); // 标记移到鼠标点击的地方
          }, 200);
        },
        false
      );
      const input = document.getElementById('searchTextField');
      that.autocomplete = new google.maps.places.Autocomplete(input);
      that.autocomplete.addListener('place_changed', function() {
        let place = this.getPlace();
        map.panTo(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        that.geocodeLatLng(
          geocoder,
          null,
          {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          marker
        );
      });
      let listPin = await axios.post(apiUrl.vevueAPI + 'listofpin', {
        userid: docCookies.getItem('userid') || '-'
      });
      listPin = listPin.data.result;
      that.markersOfPin = listPin.map((item, i) => {
        let marker = new google.maps.Marker({
          position: {
            lat: +item.location.split(',')[0],
            lng: +item.location.split(',')[1]
          },
          // animation: google.maps.Animation.BOUNCE,
          icon: {
            url: require('../../assets/images/logo_coin_100.png'),
            scaledSize: new google.maps.Size(20, 20)
          }
        });
        marker.addListener('click', function() {
          that.marker.setPosition(null);
          that.showPannel = false;
          that.infowindow.setContent(
            item.note +
              `<br/><p style='font-size:10px; margin:5px; color:#b4b4b4'>Download <a href = "http://app.vevue.com/" style='color:blue;'>Vevue App</a> and upload video to respond to this request</p>`
          );
          that.infowindow.open(that.map, marker);
        });
        return marker;
      });
      that.markerCluster = new MarkerClusterer(that.map, that.markersOfPin, {
        // imagePath: '../../../../../static/images/m',
        styles: [
          {
            url: '/images/m1.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m2.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          },
          {
            url: '/images/m3.png',
            width: 53,
            height: 53,
            fontFamily: 'comic sans ms',
            textSize: 12,
            textColor: '#fff'
          }
        ]
      });
      that.markerCluster.addListener(
        'clusterclick',
        function(cluster) {
          that.clusterClicked = true;
        },
        false
      );
    },
    checkBounds(map) {
      const that = this;
      const LAT_RANGE = 75;
      var allowedBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(-LAT_RANGE, -180),
        new google.maps.LatLng(LAT_RANGE, 180)
      );
      if (allowedBounds.contains(map.getCenter())) {
        that.lastValidCenter = map.getCenter();
        return;
      }
      map.panTo(that.lastValidCenter);
    },
    geocodeLatLng(geocoder, infowindow, lat, marker) {
      // 反向地理编码
      let that = this;
      that.showPannel = true;
      that.requestObj.locationParam = lat.lat + ',' + lat.lng;
      geocoder.geocode({ location: lat }, (results, status) => {
        if (results[0]) {
          that.locationAddressCache = results[0].formatted_address;
        } else {
          that.locationAddressCache = '';
        }
      });
      that.infowindow.open(that.map, marker);
      that.infowindow.setContent(that.$refs.requestPannel);
      that.infowindow.addListener('closeclick', function() {
        that.toEmptyRequest();
      });
    },
    CenterControl(controlDiv, map) {
      const that = this;
      // Set CSS for the control border.
      var controlUI = document.createElement('div');
      controlUI.style.backgroundColor = '#fff';
      controlUI.style.border = '2px solid #fff';
      controlUI.style.borderRadius = '3px';
      controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
      controlUI.style.cursor = 'pointer';
      controlUI.style.marginTop = '16px';
      controlUI.style.marginRight = '8px';
      controlUI.style.textAlign = 'center';
      controlUI.title = 'Click to location';
      controlDiv.appendChild(controlUI);

      // Set CSS for the control interior.
      var controlText = document.createElement('i');
      controlText.classList.add('el-icon-location');
      controlText.style.fontSize = '16px';
      controlText.style.lineHeight = '25px';
      controlText.style.paddingLeft = '5px';
      controlText.style.paddingRight = '5px';
      controlUI.appendChild(controlText);

      controlUI.addEventListener('click', function() {
        // map.setCenter(chicago);
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            function(position) {
              var latlng = new google.maps.LatLng(
                position.coords.latitude,
                position.coords.longitude
              );
              that.locationMarker.setPosition(latlng);
              map.setZoom(15);
              map.setCenter(latlng);
              // $('#you_location_img').css('background-position', '-144px 0px');
            },
            function(err) {
              console.log(err);
            }
          );
        }
      });
    },
    locationPlace(map, marker) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var latlng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );
          // const JangsuLu = new google.maps.LatLng(31.220518, 121.4306);
          marker.setPosition(latlng);
          map.setZoom(15);
          map.setCenter(latlng);
          /* !!! 后续添加 地址分类 */
          /* let infowindow = new google.maps.InfoWindow();
          let service = new google.maps.places.PlacesService(map);
          service.nearbySearch(
            {
              location: JangsuLu,
              radius: 1200,
              type: 'park'
            },
            callback
          );
          function callback(results, status) {
            console.log(results);
            if (status === google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {
                createMarker(results[i]);
              }
            }
          }

          function createMarker(place) {
            // var placeLoc = place.geometry.location;
            var marker = new google.maps.Marker({
              map: map,
              position: place.geometry.location
            });

            google.maps.event.addListener(marker, 'click', function() {
              infowindow.setContent(place.name);
              infowindow.open(map, this);
            });
          } */
        });
      }
    }
  }
};
</script>
<style lang="stylus">
.pin-vue {
  .gm-style-iw {
    // width: 100% !important;
    // left: 0px !important;
    &>div {
      // width:100%!important;
      overflow: visible !important;
    }
  }

  .sidebar {
  }

  .textFileWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 300px;
    height: 40px;
    margin: 5px;
    background: #ccc;
    // border: solid 4px #409EFF;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    position: relative;
    z-index: 2;
  }

  .searchTextField {
    width: 100%;
    height: 100%;
    padding: 10px;
    border: 0px;
    // border-radius: 4px;
    outline: none;
  }

  .taskswitch {
    position: absolute;
    top: 135px;
    right: 10px;
    z-index: 1;
    width: 25px;
    height: 25px;

    img {
      display: block;
      width: 100%;
      height: 100%;
    }
  }

  #pin-map {
    position: absolute !important;
    width: 100%;
    top: 70px;
    bottom: 0px;
    text-align: center;
  }

  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }

  .slide-fade-leave-active {
    transition: all 0.5s;
  }

  .slide-fade-enter, .slide-fade-leave-to {
    transform: translateY(20px);
    opacity: 0;
  }

  .request-pannel {
    // position: absolute;
    padding: 10px;
    width: 350px;
    bottom: 0px;
    // z-index: 200;
    margin-top: -10px;
    margin-bottom: -10px;
    margin-left: -10px;
    margin-right: -10px;
    background: #fff;

    .request-addressinfo {
      height: 65px;
      padding-top: 10px;
      padding-bottom: 10px;
      text-align: left;

      .request-header {
        font-size: 1.5rem;

        .el-icon-close {
          font-size: 1.6rem;
        }

        h3 {
          color: #409EFF;
        }

        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .locationcache {
        font-size: 1.3rem;
        display: flex;
        padding-top: 4px;
        align-items: center;

        .locationnote {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .el-icon-location-outline {
          // color: #409EFF;
        }
      }
    }

    .request-input {
      margin: 10px 0px;
    }

    .request-opt {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 10px;
      .el-button--mini{
        padding: 7px 55px;
      }
    }

    .request-award {
      display: flex;
      font-family: 'Open Sans';
      justify-content: center;
      align-items: center;

      .reward-note {
        display: flex;
        align-items: center;
        font-size: 1.4rem;
        margin-right: 10px;

        img {
          width: 20px;
          height: 20px;
          margin-right: 2px;
        }
      }

      .reward-select {
        width: 80px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 5px;
        box-shadow: 0 0 5px #ccc;
        position: relative;

        select {
          background: #fff !important;
          border: none;
          // 清除select聚焦时候的边框颜色
          outline: none;
          // 将select的宽高等于div的宽高
          width: 100%;
          height: 100%;
          // 隐藏select的下拉图标
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          padding-left: 10px;
        }

        &:after {
          content: '\e623';
          position: absolute;
          right: 10px;
          font-size: 1.6rem;
        }
      }
    }

    .requestset {
      .setitem {
        display: flex;
        justify-content: space-between;
        font-size: 1.5rem;
        padding: 8px 0px;

        .item-head {
          font-weight: bold;
        }

        .item-note {
          flex: 1;
          padding-left: 5px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

.describeDialog {
  .el-dialog__body {
    padding: 0px 10px;
  }

  .whocan-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;

    .el-icon-close {
      font-size: 1.6rem;
    }
  }
}

.follower-vue {
  position: relative;
  min-height: 100vh;
  background: #fff;

  .nomore {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    text-align: center;
    font-size: 2rem;
  }

  .flower-meta {
    display: flex;
    height: 5rem;
    margin-left: 10px;
    flex-direction: column;
    justify-content: space-around;
  }

  .followLists {
    .anyone {
      max-height: 91px;

      .follower-nickname {
        // flex:1;
        // text-align:center;
      }
    }

    .followerList {
      padding: 15px 10px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #ccc;

      img {
        width: 6rem;
        height: 6rem;
        border-radius: 50%;
        display: block;
      }
    }

    .follower-signature {
      max-height: 2rem;
      overflow: hidden;
      white-space: nowrap;
      width: 200px;
      text-overflow: ellipsis;
    }
  }
}
</style>
