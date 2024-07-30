const { logStream } = require("../logger");
const { notifications, Sequelize } = require("../models");

module.exports = (function () {
    /**
     * Create a notification entry
     * @param {string} fromUser
     * @param {string} toUser
     * @param {string} message
     */
    this.createNotification = async (notification) => {
        try {
            return {
                success: true,
                data: await notifications.create(notification),
            };
        } catch (error) {
            logStream("error", error);
            return {
                success: false,
                data: null,
                error
            };
        }
    };

    /**
     * Return no of updated documents
     * @param {string} notificationId
     * @returns []Array
     */
    this.readNotificationById = async (notificationIds) => {
        try {
            if (!notificationIds || notificationIds.length === 0) {
                return { success: false, data: null, message: "Notifiaction not found!" };
            }

            const data = await notifications.update(
                { isRead: true },
                {
                    where: {
                        id: notificationIds,
                    },
                }
            );

            return { success: true, data };

        } catch (error) {
            return {
                success: false,
                data: [],
                error
            };
        }
    };



    /**
     * Return all the notification
     * @returns []Array
     */
    this.getNotifications = async (filters = null) => {
        try {
            const data = await messages.findAll({
                where: { user_uuid: filters.userUuid },
                order: [[Sequelize.col("createdAt"), "DESC"]],
            });
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                data: [],
                error
            };
        }
    };


    /**
     * Delete all the notification for particular user
     * @returns []Array
     */
    this.deleteNotifications = async (user_uuid) => {
        try {
            const data = await notifications.destroy({ where: {
                user_uuid: user_uuid
              }})
            return { success: true, data };
        } catch (error) {
            return {
                success: false,
                data: [],
                error
            };
        }
    };

    return this;
})();
