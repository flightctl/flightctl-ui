package log

import (
	"github.com/sirupsen/logrus"
)

var log *logrus.Logger

func InitLogs() *logrus.Logger {
	log = logrus.New()

	log.SetReportCaller(true)

	return log
}

func GetLogger() *logrus.Logger {
	return log
}
