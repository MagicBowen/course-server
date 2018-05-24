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
        const user = await this.queryUser(openId);
        if (!user) {
            return callback(`not found user ${openId}`);
        }
        // if (user.phone) {
        //     return callback(`user ${openId} already has phone ${user.phone}`);
        // }
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

    async addCourse(openId, course, callback) {
        const that = this;
        const saveCourse = async (user, course, callback) => {
            try {
                const meta = await that.courseCollection.save({courseTable : course});
                try {
                    const newUser = await that.userCollection.update(user._key, {courseId : meta._key});
                    logger.info(`Add course ${meta._key} for user ${JSON.stringify(newUser)}`)
                    return callback(null)                   
                } catch (err) {
                    logger.info(`Save course id ${courseId} for user ${user.openId} failed!`);
                    return callback(err);
                }
            } catch (err) {
                logger.error('DB save course failed!');
                return callback(err);                
            }     
        }

        const user = await this.queryUser(openId);
        if (!user) {
            logger.warn(`Not found id ${openId} of user`);
            try {
                const newUser = await this.userCollection.save({openId : openId});
                logger.info(`add new user ${openId}`);
                return await saveCourse(newUser, course, callback);
            } catch(err) {
                logger.error(`DB save user ${openId} failed!`);
                return callback(err);
            }
        } else {
            logger.info(`Found id ${openId} of user ${JSON.stringify(user)}`);
            if(user.courseId) {
                await this.modifyCourse(openId, course, callback);
            } else {
                await saveCourse(user, course, callback);
            }
        }
    }

    async modifyCourse(openId, course, callback) {
        const oriCourse = await this.queryCourseByUser(openId);
        if (!oriCourse) return callback(`Not found course for user ${openId}`); 
        try {
            await this.courseCollection.update(oriCourse._key, {courseTable : course});
            return callback(null);
        } catch (err) {
            return callback(`Update course failed for user ${openId}`);
        }
    }

    async removeCourse(openId, callback) {
        const course = await this.queryCourseByUser(openId);
        if (!course) return callback(`Not found course for user ${openId}`); 
        try {
            const user = await this.queryUser(openId);
            try {
                await this.userCollection.update(user._key, {courseId : null});
                logger.debug(`remove course id ${course._key} for user ${openId}`);
            } catch (err) {
                return callback(`remove course id ${course._key} failed for user ${openId}`);
            }
            await this.courseCollection.remove(course._key);
            return callback(null);
        } catch (err) {
            return callback(`remove course ${course._key} failed for user ${openId}`);
        }
    }
}

model = new Model();

module.exports = model;
