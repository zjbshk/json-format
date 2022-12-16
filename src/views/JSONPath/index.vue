<template>
  <div class="json-path">
    <el-row>
      <el-input type="text" class="deal-search" :clearable="true" size="medium" @keyup.enter.native="searchJson"
        @clear="this.dealContent = ''" prefix-icon="el-icon-search" v-model="dealSearch" placeholder="请输入jmespath匹配">
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
          }" @init="editorInit"></editor>
      </el-col>
      <el-col :span="12">
        <el-drawer title="我是标题" :visible.sync="drawer" :with-header="false" size="75%" :modal="false">
          <p class="editor-header">
            <i class="el-icon-circle-close deal-icon" title="关闭抽屉" @click="drawer = false"
              style="margin-left: 5px;"></i>
            <i class="el-icon-copy-document deal-icon" title="复制" @click="onCopy"></i>
            <i class="el-icon-magic-stick deal-icon" title="美化(ctrl + m)" @click="magic"></i>
            <i class="el-icon-receiving deal-icon" title="压缩(ctrl + i)" @click="zip"></i>
            <img src="@/assets/fold.png" class="deal-png" title="折叠(ctrl + l)" @click="fold" />
            <img src="@/assets/unfold.png" class="deal-png" title="展开(ctrl + o)" @click="unfold" />
          </p>
          <editor ref="dcEditor" class="editor" v-model="dealContent" width="100%" :height="clientHeight" lang="json"
            :theme="theme" :options="{
              enableBasicAutocompletion: true, //启用基本自动完成
              enableSnippets: true, // 启用代码段
              enableLiveAutocompletion: true, //启用实时自动完成
              tabSize: 2, //制表符大小
              fontSize: 16, //设置字号
              showPrintMargin: false  //去除编辑器里的竖线
            }" @init="editorInit"></editor>
        </el-drawer>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { defaultContent } from '../jsondemo/content'
var jmespath = require('jmespath');
var JSONbigString = require('json-bigint')({ "storeAsString": true });


export default {
  name: 'JsonXmlPathIndex',
  components: {
    editor: require('vue2-ace-editor')
  },
  data() {
    return {
      content: '',
      drawer: false,
      dealContent: '',
      dealSearch: '',
      theme: 'tomorrow_night',
      error: false,
      json: {},
      errorMessage: '',
      parserArray: [],
      pathText: '',
      clientHeight: document.body.clientHeight - 36
    };
  },
  watch: {
    // json: {
    //   deep: true,
    //   immediate: true,
    //   handler(val) {
    //     this.parserArray = []
    //     this.jsonPath(this.parserArray, val, '$')
    //   }
    // }
  },
  computed: {
    // 滚动区高度
    // clientHeight: function () {
    //   return document.body.clientHeight - 36;
    // }
  },
  created() {
    this.content = defaultContent
  },
  mounted() {
    this.editorInit()
    window.onresize = () => {
      this.clientHeight = document.body.clientHeight - 36;
    }
  },

  methods: {
    unfold() {
      var dcSession = this.$refs['dcEditor'].editor.getSession()
      dcSession.unfold();
    },
    fold() {
      var dcSession = this.$refs['dcEditor'].editor.getSession()
      dcSession.foldAll();
    },
    magic() {
      this.parserJson(this.dealContent)
      if (this.error) {
        return
      }
      this.dealContent = JSON.stringify(this.json, null, 2);
    },
    zip() {
      this.parserJson(this.dealContent)
      if (this.error) {
        return
      }
      this.dealContent = JSON.stringify(this.json);
    },
    onCopy() {
      this.$copyText(this.dealContent).then(e => {
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
    searchJson() {
      this.parserJson(this.content)
      if (this.error) {
        return
      }
      this.drawer = true;
      var dealContent = jmespath.search(this.json, this.dealSearch);
      console.log(dealContent, this.json)
      this.dealContent = JSON.stringify(dealContent, null, 2);
      this.addCommands(this.$refs['dcEditor'].editor)
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
  height: 36px;

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