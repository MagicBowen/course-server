const logger = require('../logger').logger('arango-model');
const Database = require('arangojs').Database;
const config = require('../config.json');

class Model{
    init() {
        this.db = new Database(config.arango_uri);
        this.db.useDatabase(config.db);
        this.db.useBasicAuth(config.username, config.password);
        this.courseCollection = this.db.collection(config.courseCollection);
        this.userCollection = this.db.collection(config.userCollection);
        logger.info('Init arango model successful!');
    }

    async queryUser(openId) {
        const result = await this.db.query(`FOR u IN ${config.userCollection} FILTER u.openId == \"${openId}\" RETURN u`);
        return result._result[0];
    }

    async queryUserByDuerosId(duerosId) {
        const result = await this.db.query(`FOR u IN ${config.userCollection} FILTER u.duerosId == \"${duerosId}\" RETURN u`);
        for (let user of result._result) {
            if (!user.openId) return user
        }
        return null
    }

    async queryUserByPhone(phone) {
        const result = await this.db.query(`FOR u IN ${config.userCollection} FILTER u.phone == \"${phone}\" RETURN u`);
        return result._result[0];
    }

    async queryCourse(courseId) {
        const result = await this.db.query(`FOR c IN ${config.courseCollection} FILTER c._key == \"${courseId}\" RETURN c`);
        return result._result[0];
    }

    async queryCourseByUser(openId) {
        const user = await this.queryUser(openId);
        if (!user) {
            logger.debug(`queryCourseByUser not found user ${openId}`);
            return null;
        }
        const courseId = user.courseId;
        if (!courseId) {
            logger.debug(`queryCourseByUser not found course id for user ${openId}`);
            return null;
        }
        const course = await this.queryCourse(courseId);
        if (!course) {
            logger.debug(`queryCourseByUser not found course ${courseId} for user ${openId}`);
            return null;  
        }
        return course;
    }

    async updatePhoneForUser(user, phone) {
        try {
            await this.userCollection.update(user._key, {phone : phone});
            logger.debug(`update phone ${phone} success for user ${user.openId}`);
            return true;
        } catch (err) {
            logger.warn(`update phone ${phone} failed for user ${user.openId}`)
            return false;
        }       
    }

    async updatePhoneAndxiaomiIdForUser(user, phone, xiaomiId) {
        try {
            await this.userCollection.update(user._key, {phone : phone, xiaomiId: xiaomiId});
            logger.debug(`update phone ${phone} success for user ${user.openId}`);
            return true;
        } catch (err) {
            logger.warn(`update phone ${phone} failed for user ${user.openId}`)
            return false;
        }       
    }

    async updateOpenIdForUser(user, openId, phone) {
        try {
            await this.userCollection.update(user._key, {openId : openId});
            logger.debug(`update phone ${phone} success for user ${user.openId}`);
            return true;
        } catch (err) {
            logger.warn(`update phone ${phone} failed for user ${user.openId}`)
            return false;
        }       
    }

    async getPhone(openId, callback) {
        const user = await this.queryUser(openId);
        if (!user) {
            return callback(`not found user ${openId}`);
        }
        if (!user.phone) {
            return callback(`user ${openId} has no phone`);
        }
        return callback(null, user.phone);
    }

    async addPhone(openId, phone, callback) {
        logger.info(`add phone ${phone} , openId ${openId}`)
        const phoneUser = await this.queryUserByPhone(phone)
        const user = await this.queryUser(openId);
        if(phoneUser && !user){
            const result = await this.updateOpenIdForUser(phoneUser, openId, phone);
            if(result) return callback(null);
            return callback(`add openId ${openId} to  user for ${phone}`)
        }

        if(phoneUser && user){
            if(phoneUser._key != user._key){
                logger.info('use the course info by weixin and delete course table by xiaomi')
                await this.userCollection.remove(phoneUser._key)
                await this.updatePhoneAndxiaomiIdForUser(user, phone, phoneUser.xiaomiId);
                logger.info(`add openId ${openId} to  user success for ${phone}`)
                return callback(null)                
            }
        }

        if (!phoneUser &&!user) {
            var courseId = "weixin_" + openId
            var userInfo = {phone : phone, courseId: courseId, openId : openId}
            await this.userCollection.save(userInfo);
            logger.info(`add phone ${phone} successful for user ${openId}`)
            return callback(null)
        }

        const result = await this.updatePhoneForUser(user, phone);
        if(result)  return callback(null);
        return callback(`add phone ${phone} failed for user ${openId}`)
    }

    async modifyPhone(openId, phone, callback) {
        const user = await this.queryUser(openId);
        if (!user) {
            return callback(`not found user ${openId}`);
        }
        if (!user.phone) {
            return callback(`user ${openId} has no phone ${phone} yet`);
        }        
        const result = await this.updatePhoneForUser(user, phone);
        if(result)  return callback(null);
        return callback(`modify phone ${phone} failed for user ${openId}`)
    }

    async removePhone(openId, callback) {
        const user = await this.queryUser(openId);
        if (!user) {
            return callback(`not found user ${openId}`);
        }
        const result = await this.updatePhoneForUser(user, null);
        if(result)  return callback(null);
        return callback(`remove phone ${phone} failed for user ${openId}`)        
    }

    async getCourse(openId, callback) {
        const course = await this.queryCourseByUser(openId);
        if (!course) return callback(`Not found course for user ${openId}`); 
        return callback(null, course.courseTable);
    }

    async createCourse(courseId, course, callback) {
        try {
           await this.courseCollection.save({_key: courseId, courseTable : course});
           logger.info(`add course ${courseId} to table success`)
           callback(null);
        }catch(err){
           logger.error(`add course ${courseId} to table failed `)
           callback(err)
        }
    }

    async updateCourse(courseId, course, callback){
         try {
            await this.courseCollection.update(courseId, {courseTable : course});
            logger.info(`update course ${courseId} to table success`)
            return callback(null);
        } catch (err) {
            return callback(`Update course failed for user ${openId}`);
        }
    }

    generateCourseIdFromOpenId(openId) {
        return "weixin_" + openId
    }

    async createDuerosUser(openId, duerosId, callback) {
        var user = await this.queryUser(openId);
        var duerosUser = await this.queryUserByDuerosId(duerosId)
        if(!user){
            try {
                if (duerosUser) {
                    await this.userCollection.update(duerosUser._key, {openId : openId});
                    logger.debug(`add openId ${openId} for dueros user ${duerosId} success`);
                    return callback(null);
                } else {
                    var courseId = this.generateCourseIdFromOpenId(openId)
                    logger.info(`=====> add new user ${openId} duerosId ${duerosId} courseId: ${courseId} `);
                    const userInfo = {courseId: courseId, openId : openId, duerosId : duerosId};
                    await this.userCollection.save(userInfo);
                    logger.info(`add new dueros user ${openId} : ${duerosId} success`);
                    return callback(null);
                }
            } catch(err){
                logger.error(`add new dueros user ${openId} : ${duerosId} failed`);
                callback(err);
            }
        } else {
            try {
                if (duerosUser) {
                    await this.userCollection.remove(duerosUser._key);
                }
                await this.userCollection.update(user._key, {duerosId : duerosId});
                logger.debug(`update duerosId ${duerosId} success for user ${user.openId}`);
                return callback(null);
            } catch(err) {
                logger.error(`update dueros user ${openId} : ${duerosId} failed`);
                callback(err);                
            }
        }
    }

    async createUser(openId, callback) {
        try {
            var courseId = this.generateCourseIdFromOpenId(openId)
            logger.info(`=====> add new user ${openId}  courseId: ${courseId} `);
            const userInfo = {courseId: courseId, openId : openId}
            await this.userCollection.save(userInfo);
            logger.info(`add new user ${openId} success`);
        } catch(err){
            logger.error(`add new user ${openId} failed`);
            callback(err);
        }
    }

    async createOrUpdate(courseId, course, callback) {
        const courseInfo = await this.queryCourse(courseId);
        if(!courseInfo){
            await this.createCourse(courseId, course, callback)
        }
        else{
            await this.updateCourse(courseInfo._key, course, callback)
        }
        return callback(null);
    }

    async addCourse(openId, course, callback) {
        var user = await this.queryUser(openId);
        if(!user){
            await this.createUser(openId, callback)
            user = await this.queryUser(openId);
        }
        if(!user){
            logger.error(`DB save user ${openId} failed!`);
            return callback(`DB save user ${openId} failed!`)
        }
        await this.createOrUpdate(user.courseId, course, callback)
    }

    async modifyCourse(openId, course, callback) {
        const user = await this.queryUser(openId);
        if (!user) {
            logger.debug(`queryCourseByUser not found user ${openId}`);
            return callback(`Not found user for user ${openId}`);
        }

        await this.createOrUpdate(user.courseId, course, callback)
    }

    async removeCourse(openId, callback) {
        const course = await this.queryCourseByUser(openId);
        if (!course) return callback(`Not found course for user ${openId}`); 
        try {
            const user = await this.queryUser(openId);
            await this.courseCollection.remove(user.courseId);
            return callback(null);
        } catch (err) {
            return callback(`remove course ${course._key} failed for user ${openId}`);
        }
    }
}

model = new Model();

module.exports = model;
