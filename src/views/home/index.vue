<template>
  <div class="json-path">
    <el-row>
      <el-input type="text" class="deal-search" :clearable="true" size="medium" @keyup.enter.native="searchJson"
        @clear="clearInput" prefix-icon="el-icon-search" v-model="dealSearch" placeholder="请输入jmespath匹配">
        <i slot="suffix" class="el-input__icon el-icon-question" style="cursor: pointer;"
          onclick="window.open('//jmespath.org','_blank')" title="jmespath教程"></i>
        <!-- <i slot="suffix" class="el-input__icon el-icon-time" style="cursor: pointer;" title="历史"></i> -->
      </el-input>
    </el-row>
    <el-row>
      <el-col :span="24">
        <editor ref="cEditor" class="editor" v-model="content" width="100%" :height="clientHeight" lang="json"
          :theme="theme" :options="{
            enableBasicAutocompletion: true, //启用基本自动完成
            enableSnippets: true, // 启用代码段
            enableLiveAutocompletion: true, //启用实时自动完成
            tabSize: 2, //制表符大小
            fontSize: 16, //设置字号
            showPrintMargin: false  //去除编辑器里的竖线
          }" @init="editorInit" @contextmenu.prevent.native="openContextMenu($event)"></editor>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defaultContent } from '../data/content'
var jmespath = require('jmespath');
var JSONbigString = require('json-bigint')({ "storeAsString": true });
let basicContext = require('basiccontext');

export default {
  name: 'index',
  components: {
    editor: require('vue2-ace-editor')
  },
  data() {
    return {
      content: '',
      dealSearch: '',
      theme: 'tomorrow_night',
      error: false,
      json: {},
      errorMessage: '',
      clientHeight: document.body.clientHeight - 36
    };
  },
  watch: {
    content(val, old_val) {
      localStorage.setItem("content", val)
    },
    dealSearch(val, old_val) {
      localStorage.setItem("dealSearch", val)
    }
  },
  computed: {

  },
  created() {

  },
  mounted() {
    this.content = localStorage.getItem("content") || defaultContent
    this.dealSearch = localStorage.getItem("dealSearch")

    this.editorInit()
    window.onresize = () => {
      this.clientHeight = document.body.clientHeight - 36;
    }
  },

  methods: {
    openContextMenu(e) {

      let items = [
        { title: '&nbsp;复制', icon: 'el-icon-copy-document', fn: this.onCopy },
        { title: '&nbsp;美化<span style="font-size:10px;color:#eee;"> ctrl + m </span>', icon: 'el-icon-magic-stick', fn: this.magic },
        { title: '&nbsp;压缩<span style="font-size:10px;color:#eee;"> ctrl + i </span>', icon: 'el-icon-receiving', fn: this.zip },
        { title: '&nbsp;折叠<span style="font-size:10px;color:#eee;"> ctrl + l </span>', icon: 'el-icon-folder', fn: this.fold },
        { title: '&nbsp;展开<span style="font-size:10px;color:#eee;"> ctrl + o </span>', icon: 'el-icon-folder-opened', fn: this.unfold },
      ]

      basicContext.show(items, e);
    },
    unfold() {
      var cSession = this.$refs['cEditor'].editor.getSession()
      cSession.unfold();
    },
    fold() {
      var cSession = this.$refs['cEditor'].editor.getSession()
      cSession.foldAll();
    },
    magic() {
      this.parserJson(this.content)
      if (this.error) {
        return
      }
      this.content = JSON.stringify(this.json, null, 2);
    },
    zip() {
      this.parserJson(this.content)
      if (this.error) {
        return
      }
      this.content = JSON.stringify(this.json);
    },
    onCopy() {
      this.$copyText(this.content).then(e => {
        this.$message({
          duration: 1000,
          showClose: true,
          message: '复制成功'
        });
      }, e => {
        this.$message.error({
          duration: 1500,
          showClose: true,
          message: '复制失败'
        })
      })
    },
    editorInit() {
      require("brace/ext/language_tools")
      require("brace/mode/json")
      require("brace/ext/searchbox")
      require("brace/ext/spellcheck")
      require("brace/theme/tomorrow_night")
      require("brace/snippets/json")
    },
    saveContent() {
      localStorage.setItem("oldContent", this.content)
    },
    delContent() {
      return localStorage.removeItem("oldContent")
    },
    getContent() {
      return localStorage.getItem("oldContent")
    },
    clearInput() {
      var oc = this.getContent();
      if (oc) {
        this.content = oc
      }
      this.delContent();
    },
    searchJson() {
      var oc = this.getContent();
      if (this.dealSearch.trim().length == 0) {
        if (oc) {
          this.content = oc
        }
        this.delContent();
        return
      }

      if (!oc) {
        this.saveContent();
        oc = this.getContent();
      }

      this.parserJson(oc)
      if (this.error) {
        return
      }

      var content = jmespath.search(this.json, this.dealSearch);
      this.content = JSON.stringify(content, null, 2);
      this.addCommands(this.$refs['cEditor'].editor)
    },
    addCommands(veditor) {
      var that = this;
      var commands = veditor.commands
      commands.addCommand({
        name: 'buauty',
        bindKey: { win: 'Ctrl-m', mac: 'Command-M' },
        exec: function (editor) {
          that.magic()
        },
        readOnly: false
      });
      commands.addCommand({
        name: 'zip',
        bindKey: { win: 'Ctrl-i', mac: 'Command-I' },
        exec: function (editor) {
          that.zip()
        },
        readOnly: false
      });
      commands.addCommand({
        name: 'fold',
        bindKey: { win: 'Ctrl-l', mac: 'Command-L' },
        exec: function (editor) {
          that.fold()
        },
        readOnly: false
      });
      commands.addCommand({
        name: 'unfold',
        bindKey: { win: 'Ctrl-o', mac: 'Command-O' },
        exec: function (editor) {
          that.unfold()
        },
        readOnly: false
      });
    },
    parserJson(val) {
      try {
        this.json = JSONbigString.parse(val)
        this.error = false
        this.errorMessage = ''
      } catch (e) {
        this.error = true
        this.errorMessage = e.message
      }
    }
  },
};
</script>

<style>
.json-path {
  box-sizing: border-box;
  padding: 0px;
}

.el-col {
  text-align: left;
  height: 100%;
}

#app .deal-search {
  background-color: #25282c !important;
  font-size: 15px;
}

#app .deal-search input.el-input__inner {
  background-color: #25282c !important;
  border-radius: 0px;
  border: 1px solid #25282c !important;
  color: #fff;
}

#app .deal-search input.el-input__inner:focus {
  border: 1px solid #25282c !important;
}

.editor-header {
  background-color: #25282c !important;
  padding: 0px;
  margin: 0px;
  height: 100%;
  width: 36px;

  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: flex-start;
}

/* #app .el-drawer.rtl {
  height: calc(100% - 36px);
  top: 36px;
  bottom: 0;
} */

.deal-icon {
  color: #C0C4CC;
  padding: 10px;
  cursor: pointer;
  font-size: 18px;
}

.deal-png {
  cursor: pointer;
  padding-left: 10px;
  padding-right: 10px;
  margin-top: 9px;
  height: 20px;
  width: 20px
}

#app .ace_search.right {
  background-color: #25282c;
  border: 3px solid #25282c;
}

#app .ace_button {
  color: #eee;
}

#app .ace_button:hover {
  background-color: #4c4a4a;
}
</style>