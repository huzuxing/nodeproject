'use strict';
var express = require('express');
let app = express();
var router = express.Router();
const CONSTANT = require('../../common/Constant');
const request = require('request');
const channelService = require('../../service/ChannelService');

/**
 * 获取栏目
 */
router.get('/', function (req, res) {
    let pageNo = req.query.pageNo || 1;
    let pageSize = req.query.pageSize || 10;
    let q = req.query.q;
    let bean = {
        name: q
    };
    let page = {
        pageNo: pageNo,
        pageSize: pageSize,
        q: q,
        prePage: (pageNo - 1) <= 0 ? 1 : pageNo - 1,
    };
    channelService.count(bean).then(count => {
        page.totalCount = count;
        page.totalPage = (count / pageSize) == 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
        page.nextPage = (pageNo + 1) > page.totalPage ? page.totalPage : pageNo + 1;
        return channelService.findPage(bean, pageNo, pageSize);
    }).then(result => {
        res.locals.data = result;
        res.locals.page = page;
        res.render('admin/channel/list');
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
});

/**
 * 菜单编辑
 */
router.get('/edit/:id', function (req, res) {
    let id = req.params.id;
    let menus = [];
    channelService.getById(id).then(result => {
        res.locals.bean = result;
        res.render('admin/channel/edit');
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
});

/**
 * 添加子菜单
 */
router.get('/addChild/:id', function (req, res) {
    let id = req.params.id;
    service.moduleService.list().then(result => {
        res.locals.bean = {
            parentId: id
        };
        res.locals.menus = result;
        res.render('admin/menu/detail');
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
});


router.get('/manage', function (req, res) {
    let pageNo = req.query.pageNo || 1;
    let pageSize = req.query.pageSize || 10;
    let q = req.query.q;
    let bean = {
        zhName: q
    };
    let page = {
        pageNo: pageNo,
        pageSize: pageSize,
        q: q,
        prePage: (pageNo - 1) <= 0 ? 1 : pageNo - 1,
    };
    service.moduleService.count(bean).then(count => {
        page.totalCount = count;
        page.totalPage = (count / pageSize) == 0 ? count / pageSize : Math.floor(count / pageSize) + 1;
        page.nextPage = (pageNo + 1) > page.totalPage ? page.totalPage : pageNo + 1;
        return service.moduleService.getMenus(bean, pageNo, pageSize);
    }).then(result => {
        res.locals.menus = result;
        res.locals.page = page;
        res.render('admin/menu/list');
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
});

router.get('/add', function (req, res) {
    res.render('admin/channel/add');
});

/**
 * 添加菜单
 */
router.post('/', save);

router.post('/update', update);

function save(req, res) {
    let bean = {};
    for (let i in req.body) {
        bean[i] = req.body[i];
    }
    bean.createTime = new Date();
    channelService.save(bean).then(result => {
        if (result)
            res.jsonp({code: CONSTANT.SUCCESS_CODE});
        else
            res.jsonp({code: CONSTANT.FAIL_CODE, msg: CONSTANT.COMMON_MSG});
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
}

function update(req, res) {
    let bean = {};
    let flag = true;
    for (let i in req.body) {
        bean[i] = req.body[i];
        if ("" == bean[i]) {
            flag = false;
            break;
        }
    }
    if (!flag) {
        res.jsonp({code: CONSTANT.PARAM_FAIL_CODE, msg: CONSTANT.PARAM_FAIL_MSG});
        return;
    }
    if (bean.id) {
        channelService.getById(bean.id).then(result => {
            if (result && result.id > 0) {
                for (let key in bean) {
                    result[key] = bean[key];
                }
                result.updateTime = new Date();
                channelService.update(result).then(result => {
                    if (result)
                        res.jsonp({code: CONSTANT.SUCCESS_CODE});
                    else
                        res.jsonp({code: CONSTANT.FAIL_CODE, msg: CONSTANT.COMMON_MSG});
                }).catch(ex => {
                    console.error(ex);
                    res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
                });
            }
        });
    }
}

// 删除菜单
router.post('/delete', remove);

function remove(req, res) {
    let id = req.body.id;
    if (!!id) {
        channelService.delete(id).then(result => {
            if (result) {
                res.jsonp({code: CONSTANT.SUCCESS_CODE});
            }
            else {
                res.jsonp({code: CONSTANT.FAIL_CODE, msg: CONSTANT.COMMON_MSG});
            }
        }).catch(ex => {
            console.error(ex);
            res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
        });
    }
    else
        res.jsonp({code: CONSTANT.PARAM_FAIL_CODE, msg: CONSTANT.PARAM_FAIL_MSG});
}

//查看
router.get('/check/:id', function (req, res) {
    let id = req.params.id;
    let bean = {};
    if (!id) {
       return res.jsonp({code: CONSTANT.PARAM_FAIL_CODE, msg: CONSTANT.PARAM_FAIL_MSG});
    }
    channelService.getById(id).then(result => {
        bean = result;
        bean.createTime = new Date(bean.createTime).format('yyyy-MM-dd hh:mm:ss');
        bean.updateTime = new Date(bean.updateTime).format('yyyy-MM-dd hh:mm:ss');
        res.render('admin/channel/check', {bean: bean});
    }).catch(ex => {
        console.error(ex);
        res.jsonp({code: CONSTANT.FAIL_CODE, msg: ex.message});
    });
});

module.exports = router;
