<template>
  <div>
    <div class="topHeader">
      <div class="topHeader-inner">
        <a href="/">
          <img src="../../assets/images/logo-01.png" alt="vevue" class="header-logo"></a>
      </div>
    </div>
    <el-progress class="uploadProgress" :class="{width100Per:uploadPercent}" :text-inside="true" :show-text='false' :stroke-width="8" :percentage="uploadPercent" status='success'></el-progress>

    <div class="uploadBox">
      <!-- <input type="file" @change='getPicInfo' accept=".png,.jpg"> -->
      <!-- <img id="element_id" src="../../home/assets/images/vevue_logo_50x50.png"> -->
      <el-upload v-show="!fileStatus.videoUrl" :show-file-list='false' ref="uploadVideo" class="upload-demo" drag action="" accept="video/mp4" :limit='1' :auto-upload='false' :multiple='false' :on-change='successFile'>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Drag the file here, or
          <em>click to upload</em>
        </div>
      </el-upload>
      <div class="videoBox" v-show="fileStatus.videoUrl">
        <div class="buttonBox">
          <div class="reUploadVideo">
            <el-upload :on-change='successFile' ref="reUploadVideo" :show-file-list='false' :auto-upload='false' :limit="1" action="">
              <el-button size="medium" type="primary">Reselect Video</el-button>
            </el-upload>
          </div>
          <el-button type="danger" class="screenShootVideoPic" @click="screenShootVideoPic({popMessage:true})" href="javascript:void(0)">Take Screenshot as Cover</el-button>
        </div>
        <video :src="fileStatus.videoUrl" controls ref="videoEle" id="videoEle" class="video" @loadeddata="screenShootVideoPic" autoplay>
        </video>
      </div>
      <!-- <img :src="fileStatus.videoPicUrl" alt="videoScreenShoot"> -->
      <div class="uploadTextBox">
        <el-input class="inputLine" v-model="fileStatus.title" placeholder="Title"></el-input>
        <p class="text-length" :class="{red: fileStatus.title.length> limit.maxTitle}">
          <span>{{fileStatus.title.length}} / {{limit.maxTitle}}</span>
        </p>
        <el-input class="inputLine" v-model="fileStatus.note" placeholder="Description"></el-input>
        <p class="text-length" :class="{red: fileStatus.note.length>limit.maxNote}">
          <span>{{fileStatus.note.length}} / {{limit.maxNote}}</span>
        </p>
        <div class="typeSelect inputLine tagBox">
          <div class="tag">
            <div class="borderRight">
              <el-tag>Video Type</el-tag>
            </div>
          </div>
          <div>
            <el-radio v-model="fileStatus.videoType" label="Common" border size='mini'></el-radio>
            <el-radio v-model="fileStatus.videoType" label="VR" border size='mini'></el-radio>
          </div>
        </div>
        <div class="tagBox inputLine">
          <div class="tag">
            <div class="borderRight">
              <el-tag>Tag</el-tag>
            </div>
          </div>
          <div class="tagLists">
            <el-checkbox-group v-model="defaultTags" size="small">
              <el-checkbox label="Time-Lapse" border></el-checkbox>
              <el-checkbox label="Drone" border></el-checkbox>
              <el-checkbox label="Slow-Motion" border></el-checkbox>
            </el-checkbox-group>
            <el-tag :key="tag" v-for="tag in typeTags" closable :disable-transitions="false" @close="handleClose(tag,'typeTags')">
              {{tag}}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputTagVisible" v-model="inputTagValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm('typeTags','inputTagVisible')" @blur="handleInputConfirm('typeTags','inputTagVisible')">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showTagInput('inputTagVisible')">+ New Tag</el-button>
          </div>
        </div>
        <!-- <div class="tagBox inputLine">
          <div class="tag">
            <div class="borderRight">
              <el-tag>Tools</el-tag>
            </div>
          </div>
          <div class="tagLists">
            <el-checkbox-group v-model="defaultTags" size="small">
              <el-checkbox label="iMovie" border></el-checkbox>
              <el-checkbox label="VUE" border></el-checkbox>
              <el-checkbox label="Go-Pro" border></el-checkbox>
            </el-checkbox-group>
            <el-tag :key="tag" v-for="tag in toolsTags" closable :disable-transitions="false" @close="handleClose(tag,'toolsTags')">
              {{tag}}
            </el-tag>
            <el-input class="input-new-tag" v-if="inputTagToolsVisible" v-model="inputTagValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm('toolsTags','inputTagToolsVisible')" @blur="handleInputConfirm('toolsTags','inputTagToolsVisible')">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showTagInput('inputTagToolsVisible')">+ New Tag</el-button>
          </div>
        </div> -->
        <div class="setLocation inputLine tagBox">
          <div class="switch-flex">
            <span>Location </span>
            <div v-show="addressSwitch" class="addressText" @click='dialogVisible = true'>
              <span>{{locationAddress}}</span>
              <i v-show="locationAddress" class="el-icon-arrow-right"></i>
            </div>
            <el-switch v-model="addressSwitch" @change="toSwitchAdress"></el-switch>
          </div>
        </div>
        <div class="setCopyright inputLine tagBox">
          <div class="switch-flex">
            <span>Copyright Protection</span>
            <el-switch v-model='copyrightSwitch'></el-switch>
          </div>
          <div v-show="copyrightSwitch">
            <br/> Vevue will storage the video’s copyright information on BlockChain.
            <br/><br/> Please ensure that you are the original author, or we will force taking the copyright back and freeze your account forever. The legal consequences arising from you are borne by yourself.
                    </div>
          </div>
          <div class='setSplitter inputLine tagBox'>
            <div class="switch-flex">
              <span>Splitter</span>
              <el-switch v-model='splitterSwitch'></el-switch>
            </div>
          </div>
          <div class="typeSelect inputLine tagBox">
            <div class="tag">
              <div class="borderRight">
                <el-tag>Price</el-tag>
              </div>
            </div>
            <div>
              <el-select v-model="fileStatus.price" placeholder="请选择">
                <el-option v-for="item in priceRange" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
            </div>
          </div>
        </div>
        <el-button type="primary" @click="toUploadVideo" :class="{disabled:uploadStatus}">Upload</el-button>
        <!-- <el-button type="primary" @click="toUploadPicTest" :class="{disabled:uploadStatus}">Test</el-button> -->
      </div>
      <el-dialog title="" :close-on-click-modal='false' :visible.sync="dialogVisible" width="30%" :before-close="handleCloseDialog" id="mapDialog">
        <div id="showmap">
          <input type="text" id='searchTextField' class="controls searchTextField" placeholder="Search address">
          <div id="map"></div>
          <span class="address-text">{{locationAddressCache}}</span>
        </div>
        <div class="dialog-footer">
          <el-button @click="handleCloseDialog">Cancel</el-button>
          <el-button class="done" type="primary" @click="closeDialogSetAddress">Done</el-button>
        </div>
      </el-dialog>
    </div>
</template>
<script>
// import JcropModule from '../assest/js/jquery.Jcrop.js';
// import $ from 'jquery';
import axios from 'axios';
import apiUrl from '../../assets/js/config/urlConfig.js';
import jsFormat from '../../static/tools/jsFormat.js';
import totp from '../../static/tools/totp.js';
import SparkMD5 from 'spark-md5';
import docCookies from '../../static/tools/cookies.js';
import AWS from 'aws-sdk';
AWS.config.update({
  region: 'us-east-1',
  credentials: new AWS.CognitoIdentityCredentials({
    // IdentityPoolId: 'us-east-1:d2a00d26-6d1f-44fb-bf2d-9070382a086f'
    IdentityPoolId: 'us-east-1:64864bf3-8f6f-4c2b-b38e-56079efbca7e'
  })
});
const BUCKET = 'vevue-us';
let jcropApi;
export default {
  name: 'picUpload',
  data() {
    return {
      loginStatus: '0', // 登录状态
      apiUrl,
      dialogVisible: false,
      picUrl: '',
      defaultTags: [],
      typeTags: [],
      toolsTags: [],
      addressSwitch: false,
      copyrightSwitch: false,
      splitterSwitch: false,
      inputTagVisible: false,
      inputTagToolsVisible: false,
      priceRange: [
        {
          value: 0,
          label: 'Free'
        },
        {
          value: 0.001,
          label: 0.001
        },
        {
          value: 0.005,
          label: 0.005
        },
        {
          value: 0.01,
          label: 0.01
        },
        {
          value: 0.05,
          label: 0.05
        },
        {
          value: 1,
          label: 1
        },
        {
          value: 5,
          label: 5
        },
        {
          value: 10,
          label: 10
        }
      ],
      inputTagValue: '',
      locationAddressCache: '',
      locationAddress: '',
      uploadPercent: 0, // 上传百分比
      uploadStatus: false, // 上传状态 false 未上传, true 上传中
      limit: {
        maxTitle: 20,
        maxNote: 200
      },
      fileStatus: {
        title: '',
        note: '',
        price: 0,
        videoType: 'Common',
        tags: [],
        copyRight: '',
        locationParam: '',
        videoID: '',
        videoid_real: '',
        videoUrl: '', // 视频地址
        videoPicUrl: '', // 视频截取帧地址
        videoPicBlob: '' // 视频截取帧blob格式
      }
    };
  },
  head() {
    return {
      script: [
        {
          src:
            '//maps.googleapis.com/maps/api/js?key=AIzaSyD6Zh2AjPRc9CN7qMLKUxAHxBw_M57RbwU&libraries=places'
        }
      ]
    };
  },
  beforeMount() {},
  mounted() {
    (function() {
      if (!docCookies.getItem('safekey')) {
        location.href = '/login?continue=' + encodeURIComponent('/upload');
      }
    })();

    let topHeader = document.querySelector('.topHeader');
    let uploadProgress = document.querySelector('.uploadProgress');
    window.addEventListener('scroll', () => {
      if (document.documentElement.scrollTop >= topHeader.offsetHeight) {
        uploadProgress.style.position = 'fixed';
      } else {
        uploadProgress.style.position = 'relative';
      }
    });
    if (docCookies.getItem('safekey') && docCookies.getItem('nickname')) {
      this.loginStatus = 1;
    }
    this.observerDialogDom();
  },
  methods: {
    loginSuccess(data) {
      // 登陆界面 待销毁
      this.loginStatus = 1;
      docCookies.setItem('userid', data.userid, this.cookiesEnd, '/', null);
      docCookies.setItem('cid', data.cid, this.cookiesEnd, '/', null);
      docCookies.setItem('safekey', data.safekey, this.cookiesEnd, '/', null);
      docCookies.setItem('avatar', data.avatar, this.cookiesEnd, '/', null);
      docCookies.setItem('nickname', data.nickname, this.cookiesEnd, '/', null);
      docCookies.setItem('gender', data.gender, this.cookiesEnd, '/', null);
    },
    observerDialogDom() {
      let that = this;
      let MutationObserver =
        window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver;
      let observer = new MutationObserver(function(a, b) {
        // 监听dialog下的mapdialog dom结构是否变化
        that.initMap();
        observer.disconnect(); // 只监听一次,随后取消监听
      });
      let config = { attributes: true, childList: true, characterData: true };
      observer.observe(document.getElementById('mapDialog'), config);
    },
    initMap() {
      let that = this;
      let uluru = { lat: 39.83, lng: -101.785 };
      that.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: uluru
      });
      that.geocoder = new google.maps.Geocoder();
      let geocoder = that.geocoder;
      let map = that.map;
      that.marker = new google.maps.Marker({
        map: map
      });
      let marker = that.marker;
      map.addListener('click', function(e) {
        marker.setPosition(e.latLng); // 标记移到鼠标点击的地方
        that.geocodeLatLng(geocoder, null, {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        });
      });
      let input = document.getElementById('searchTextField');
      that.autocomplete = new google.maps.places.Autocomplete(input);
      that.autocomplete.addListener('place_changed', function() {
        let place = this.getPlace();
        map.panTo(place.geometry.location);
        map.setZoom(15);
        marker.setPosition(place.geometry.location);
        that.geocodeLatLng(geocoder, null, {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        });
      });
    },
    geocodeLatLng(geocoder, infowindow, lat) {
      // 反向地理编码
      let that = this;
      that.fileStatus.locationParam = lat.lat + ',' + lat.lng;
      geocoder.geocode({ location: lat }, (results, status) => {
        if (results[0]) {
          that.locationAddressCache = results[0].formatted_address;
        } else {
          that.locationAddressCache = '';
        }
      });
    },
    toUploadVideo() {
      this.uploadStatus = true;
      let fileStatus = this.fileStatus;
      let limit = this.limit;
      // if(fileStatus.title.length)
      if (!fileStatus.videoUrl) {
        this.uploadStatus = false;
        return this.$message.error('Please select video to upload!');
      }
      if (!fileStatus.videoPicBlob) {
        this.uploadStatus = false;
        return this.$message.error('Please set cover.');
      }
      if (!fileStatus.title.trim()) {
        this.uploadStatus = false;
        return this.$message.error('Please enter title.');
      } else if (fileStatus.title.length > limit.maxTitle) {
        this.uploadStatus = false;
        return this.$message.error(
          'The maximum length of title is ' + limit.maxTitle + '.'
        );
      }
      if (fileStatus.note.length > limit.maxNote) {
        this.uploadStatus = false;
        return this.$message.error(
          'The maximum length of description is ' + limit.maxNote + '.'
        );
      }
      fileStatus.videoID = SparkMD5.hash(
        docCookies.getItem('userid') +
          this.guid() +
          fileStatus.size +
          fileStatus.name
      );
      fileStatus.unitlock = SparkMD5.hash(fileStatus.videoID + fileStatus.note);
      if (fileStatus.price > 0) {
        fileStatus.videoid_real = SparkMD5.hash(
          fileStatus.videoID + this.guid()
        );
      }
      let params = {
        Bucket: BUCKET,
        Key:
          'video/' + (fileStatus.videoid_real || fileStatus.videoID) + '.mp4',
        Body: fileStatus.File,
        ACL: 'public-read'
      };
      let upload = new AWS.S3.ManagedUpload({ params: params });
      upload.send((err, data) => {
        if (err) {
          console.log('upload send error');
          console.log(err);
          this.$message.error(err.message);
          this.uploadStatus = false;
        } else {
          this.toUploadPic();
        }
      });
      upload.on('httpUploadProgress', res => {
        this.uploadPercent = (res.loaded / res.total).toFixed(2) * 100;
      });
    },
    guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(
        c
      ) {
        let r = (Math.random() * 16) | 0;
        let v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
    toUploadPic() {
      let fileStatus = this.fileStatus;
      let params = {
        Bucket: BUCKET,
        Key: 'video/' + fileStatus.videoID + '.jpg',
        Body: fileStatus.videoPicBlob,
        ACL: 'public-read'
      };
      let upload = new AWS.S3.ManagedUpload({ params: params });
      upload.send((err, data) => {
        if (err) {
          this.$message.error(err.message);
          this.uploadStatus = false;
        } else {
          this.tellServerToUpdate();
        }
      });
      upload.on('httpUploadProgress', res => {
        this.uploadPercent = (res.loaded / res.total).toFixed(2) * 100;
      });
    },
    toUploadPicTest() {
      let fileStatus = this.fileStatus;
      const timer = new Date().getTime();
      let params = {
        Bucket: BUCKET,
        Key: 'video/' + timer + '.jpg',
        Body: fileStatus.videoPicBlob,
        ACL: 'public-read'
      };
      let upload = new AWS.S3.ManagedUpload({ params: params });
      upload.send((err, data) => {
        if (err) {
          this.$message.error(err.message);
          this.uploadStatus = false;
        } else {
          // this.tellServerToUpdate();
          console.log('上传完成');
          console.log('ts/' + timer + '.jpg');
        }
      });
      upload.on('httpUploadProgress', res => {
        this.uploadPercent = (res.loaded / res.total).toFixed(2) * 100;
      });
    },
    tellServerToUpdate() {
      let authcode = totp.getCode(docCookies.getItem('safekey'));
      let data = {};
      let fileStatus = this.fileStatus;
      // data.action = 'addvideo';
      data.toeventid = '';
      data.towho = '';
      data.videoid = fileStatus.videoID;
      data.videoid_real = fileStatus.videoid_real;
      data.price = fileStatus.price;
      data.userid = docCookies.getItem('userid');
      data.cid = docCookies.getItem('cid');
      data.note = fileStatus.note;
      data.title = fileStatus.title;
      data.unitlock = fileStatus.unitlock;
      data.timestamp = Math.floor(new Date().getTime() / 1000);
      data.authcode = authcode;
      data.videotype = 'vevue';
      data.video_time = fileStatus.video_time;
      data.tags = this.defaultTags.join(',') + ',' + this.typeTags.join(',');
      if (fileStatus.videoType === 'VR') {
        data.mode_vr = 'vr';
      } else {
        data.mode_vr = '';
      }
      if (this.addressSwitch) {
        data.location = fileStatus.locationParam;
        data.location_name = this.locationAddress;
      } else {
        data.location = '';
        data.location_name = '';
      }
      data.copyright = this.copyrightSwitch ? 'sign' : '';
      data.splitter = this.splitterSwitch ? true : false;
      axios
        .post(this.apiUrl.vevueAPI + 'addvideo', data)
        .then(res => {
          this.uploadStatus = false; // 上传结束
          if (res.data.errcode === 0) {
            // 上传成功, 清空文件
            /* this.$refs.uploadVideo.clearFiles();
            this.$refs.reUploadVideo.clearFiles();
            this.fileStatus.videoUrl = '';
            this.fileStatus.title = '';
            this.fileStatus.note = '';
            this.fileStatus.videoPicBlob = '';
            this.uploadPercent = 0;
            this.locationAddress = ''; // 清空地址
            this.locationAddressCache = ''; // 清空地址缓存
            this.addressSwitch = false; // 关闭地址开关
            this.copyrightSwitch = false; // 关闭版权开关 */
            this.$message({
              message: 'upload success!',
              type: 'success',
              duration: 800
            });
            setTimeout(() => {
              location.href = location.origin + '/video/' + data.videoid;
            }, 900);
          } else {
            this.$message.error('upload failed');
          }
        })
        .catch(res => {
          this.uploadStatus = false; // 上传结束
          // console.error(res);
        });
    },
    handleCloseDialog(done) {
      this.dialogVisible = false;
      this.addressSwitch = !!this.locationAddress;
    },
    closeDialogSetAddress() {
      this.locationAddress = this.locationAddressCache;
      this.dialogVisible = false;
      this.addressSwitch = !!this.locationAddress;
    },
    successFile(e, fileList) {
      let size = e.size;
      if (size > 819200000 || size < 1024000) {
        this.$refs.uploadVideo.clearFiles();
        this.$refs.reUploadVideo.clearFiles();
        this.$message({
          message: 'Video size is limited to 1M-800M',
          type: 'error'
        });
        return;
      }
      if (e.raw.type !== 'video/mp4') {
        this.$refs.uploadVideo.clearFiles();
        this.$refs.reUploadVideo.clearFiles();
        this.$message({
          message: 'Only supports uploading videos in mp4 format',
          type: 'error'
        });
        return;
      }
      this.$refs.uploadVideo.clearFiles();
      this.$refs.reUploadVideo.clearFiles();
      this.fileStatus.videoPicUrl = '';
      this.fileStatus.videoPicBlob = '';
      this.fileStatus.File = e.raw;
      this.fileStatus.videoUrl = e.url; // blog文件地址
      this.fileStatus.name = e.name;
      this.fileStatus.size = e.size;
      let videoEle = document.getElementById('videoEle');
      videoEle.addEventListener('loadeddata', () => {
        this.fileStatus.video_time = Math.ceil(videoEle.duration);
      });
    },
    toComputeVideoMd5(file) {
      let blobSlice =
        File.prototype.slice ||
        File.prototype.mozSlice ||
        File.prototype.webkitSlice;
      let chunkSize = 2097152; // Read in chunks of 2MB
      let chunks = Math.ceil(file.size / chunkSize);
      let currentChunk = 0;
      let spark = new SparkMD5.ArrayBuffer();
      let fileReader = new FileReader();
      fileReader.onload = function(e) {
        spark.append(e.target.result); // Append array buffer
        currentChunk++;

        if (currentChunk < chunks) {
          loadNext();
        } else {
          console.info('computed hash', spark.end()); // Compute hash
        }
      };
      fileReader.onerror = function() {
        console.warn('oops, something went wrong.');
      };

      function loadNext() {
        let start = currentChunk * chunkSize;
        let end =
          start + chunkSize >= file.size ? file.size : start + chunkSize;

        fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
      }
      loadNext();
    },
    toSwitchAdress(flag) {
      if (flag) {
        this.dialogVisible = true;
      }
    },
    getPicInfo(e) {
      // let that = this;
      let reader = new FileReader();
      reader.addEventListener(
        'load',
        function() {
          jcropApi.setImage(reader.result);
        },
        false
      );
      reader.readAsDataURL(e.target.files[0]);
    },
    screenShootVideoPic(option) {
      let that = this;
      // let videoEle = that.$refs.videoEle;
      let videoEle = document.getElementById('videoEle');
      let canvas = document.createElement('canvas');
      canvas.width = videoEle.videoWidth;
      canvas.height = videoEle.videoHeight;
      canvas
        .getContext('2d')
        .drawImage(videoEle, 0, 0, canvas.width, canvas.height);
      that.fileStatus.videoPicUrl = canvas.toDataURL('image/jpge');
      that.fileStatus.videoPicBlob = jsFormat.dataURLtoBlob(
        canvas.toDataURL('image/jpge')
      );
      if (option) {
        if (option.popMessage) {
          // 是否弹出消息提示
          that.$message({
            message: 'screenshoot success',
            duration: 2000,
            type: 'success'
          });
        }
      }
    },
    handleClose(tag, option) {
      this[option].splice(this[option].indexOf(tag), 1);
    },
    showTagInput(option) {
      this[option] = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleInputConfirm(option, input) {
      let inputTagValue = this.inputTagValue;
      if (inputTagValue) {
        this[option].push(inputTagValue);
      }
      this[input] = false;
      this.inputTagValue = '';
    }
  }
};
</script>
<style lang="stylus">
#showmap {
  width: 100%;
  height: 100%;
  position: relative;

  .address-text {
    display: inline-block;
    margin: 5px 0px;
    font-size: 12px;
  }
}

#map {
  height: 400px;
  width: 100%;
}

.topHeader {
  display: flex;
  height: 70px;
  flex: 1;
  align-items: center;
  background-color: #fff;
  justify-content: space-between;
  padding: 0 20px;
}

.header-logo {
  width: 155px;
  height: 40px;
  display: block;
}

.videoBox {
  position: relative;
  margin: 0 auto;
  width: 100%;

  &:hover .buttonBox {
    display: block;
  }

  .buttonBox {
    display: none;
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  .video {
    position: relative;
    width: 100%;
    height: 450px;
    background-color: #333;
  }
}

.uploadTextBox {
  margin-top: 20px;
}

.upload-demo {
  text-align: center;
}

.uploadBox {
  max-width: 800px;
  margin: 20px auto;

  .typeSelect {
    padding: 10px;
    border: solid #ccc 1px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #606266;

    p:first-child {
      margin-right: 20px;
    }
  }
}

.buttonBox {
  .el-upload {
    width: auto;
    height: auto;
  }

  .el-button {
    width: 210px;
    height: 40px;
  }
}

.reUploadVideo {
  margin-bottom: 10px;
}

.el-upload {
  width: 100%;
  height: 450px;

  .el-upload-dragger {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .el-icon-upload {
    margin: 0;
    line-height: inherit;
  }
}

.inputLine {
  margin-bottom: 10px;
}

.text-length {
  text-align: right;
  font-size: 14px;
  margin-bottom: 5px;
  margin-top: -5px;
}

.tagBox {
  display: flex;
  padding: 10px;
  border: solid #ccc 1px;
  border-radius: 4px;

  .tagLists {
    .el-checkbox__input {
      display: none;
    }

    .el-checkbox-group {
      margin-bottom: 10px;
    }

    .el-checkbox.is-checked {
      background-color: rgba(64, 158, 255, 0.1);
      border: 1px solid rgba(64, 158, 255, 0.2);
    }
  }

  .tag .borderRight {
    border-right: solid 1px #ccc;
    margin-right: 10px;
  }

  .el-tag {
    margin-right: 10px;
  }

  .button-new-tag {
    margin-right: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .input-new-tag {
    width: 90px;
    // margin-left: 10px;
    vertical-align: bottom;
  }
}

.pac-container {
  z-index: 9999;
}

.searchTextField {
  // position: absolute;
  width: 100%;
  margin: 10px 0px;
  z-index: 1;
  padding: 10px;
  border: solid 1px #ccc;
  border-radius: 2px;
  top: 2px;
  left: 2px;
  outline: none;
  font-size: 14px;
}

.addressText {
  cursor: pointer;
}

.switch-flex {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.setLocation {
  font-size: 12px;

  .border {
    border-top: solid 1px #ccc;
    border-bottom: solid 1px #ccc;
    padding: 5px 0px;
  }

  .addressText {
    flex: 1;
    display: inline-block;
    margin-left: 20px;
    color: #409EFF;
  }
}

.setCopyright {
  font-size: 12px;
  // flex-direction: column;
  flex-wrap: wrap;

  .border {
    border-top: solid 1px #ccc;
    border-bottom: solid 1px #ccc;
    padding: 5px 0px;
  }
}

.setSplitter {
  font-size: 12px;
  // flex-direction: column;
  flex-wrap: wrap;
}

.el-progress-bar__outer {
  border-radius: 0px;
  background-color: #409eff;

  .el-progress-bar__inner {
    border-radius: 0px;
  }
}

.topHeader {
  // height: 90px;
}

.uploadProgress {
  &.width100Per {
    width: 100%;
  }

  transition: 1s all;
  width: 0px;
  z-index: 99999;
  top: 0px;
}

.el-button--primary {
  display: block;
  margin: auto;
}

.el-switch {
  margin-left: 5px;
}

.dialog-footer {
  display: flex;
  margin-top: 10px;
  justify-content: space-between;

  .done {
    margin: 0px;
  }
}

.el-dialog__body {
  padding-top: 5px !important;
}

.toPlay.iconfont {
  position: absolute;
  font-size: 70px;
  bottom: 40px;
  color: #fff;
  text-shadow: #000;
  left: 0px;
}
</style>
