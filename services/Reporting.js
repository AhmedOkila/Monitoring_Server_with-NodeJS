const axios = require("axios").default;
const cron = require("node-cron");
const User = require("../models/user");
const Check = require("../models/check");
const Report = require("../models/report");
const mailService = require("../services/mailing");

class ReportingSerivce {
  static monitoredChecks = {};

  creatingCheckReport(check) {
    const clientInstance = axios.create({
      baseURL: check.url,
      timeout: check.timeout * 1000,
    });
    // axiosRetry(clientInstance, {retries: check.threshold});
    //! Constants for Reporting
    let startTime;
    let endTime;
    let responseTime;
    let log;
    let status;
    startTime = Date.now();
    clientInstance.get(check.path)
    // Here we have 2 Options
    // Option 1 => we get a Response from Server, so that the Server is Up
    // Option 2 => we get no Response from Server, so that the Server is Down
      .then((res) => {
        //############# Option 1 ###########################
        endTime = Date.now();
        responseTime = (endTime - startTime) / 1000; //! In Seconds
        status = res.status;
        log = `Success Monitoring for this Check at ${new Date(
          endTime
        ).toLocaleString()}`;
        Report.findOne({ checkId: check._id })
          .then((report) => {
            if (!report) {
              const error = new Error("Could not find Report for this Check");
              error.statusCode = 404;
              throw error;
            }
            report.uptime += check.interval * 60; //! In Seconds
            report.history.push(log);
            report.responseTime = responseTime;
            report.availability = (
              (report.uptime * 100) /
              (report.uptime + report.downtime)
            ).toFixed(2);
            if (report.status != status) {
              //! Send UpTime Notification
              User.findOne({ _id: check.ownedBy }).then((user) => {
                mailService.upCheckNotificationAfterDown(user);
              });
            }
            report.status = status;
            return report.save();
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      })
      .catch((error) => {
        //############# Option 2 ###########################
        endTime = Date.now();
        status = 500;
        log = `Failed Monitoring for this Check at ${new Date(
          endTime
        ).toLocaleString()}`;
        Report.findOne({ checkId: check._id })
          .then((report) => {
            if (!report) {
              const error = new Error("Could not find Report for this Check");
              error.statusCode = 404;
              throw error;
            }
            report.downtime += check.interval * 60; //! In Seconds
            report.history.push(log);
            report.outages++;
            report.availability =
              (report.uptime * 100) / (report.uptime + report.downtime);
            if (report.status != status) {
              //! Send DownTime Notification
              User.findOne({ _id: check.ownedBy }).then((user) => {
                mailService.downCheckNotification(user);
              });
            }
            report.status = status;
            return report.save();
          })
          .catch((err) => {
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      });
  }

  startMonitoring() {
    Check.find({})
      .then((checks) => {
        checks.forEach((check) => {
          ReportingSerivce.monitoredChecks[check._id] = cron.schedule(
            `*/${check.interval} * * * *`,
            () => {
              this.creatingCheckReport(check);
            }
          );
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }

  addCheckToMonitoredChecks(check) {
    ReportingSerivce.monitoredChecks[check._id] = cron.schedule(
      `*/${check.interval} * * * *`,
      () => {
        this.creatingCheckReport(check);
      }
    );
  }

  deleteCheckFromMonitoredChecks(check) {
    ReportingSerivce.monitoredChecks[check._id].stop();
  }
}

module.exports = new ReportingSerivce();
