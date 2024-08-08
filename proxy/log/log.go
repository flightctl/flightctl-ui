package log

import (
	"github.com/sirupsen/logrus"
)

func InitLogs() *logrus.Logger {
	log := logrus.New()

	log.SetReportCaller(true)

	return log
}
