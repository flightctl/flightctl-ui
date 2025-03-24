import * as React from 'react';

type TimeZoneMap = Record<string, string>;

// Hook allows us to only load the timeZones when they are being used
const useTimeZones = () => {
  const [zones, setZones] = React.useState<TimeZoneMap>({});

  React.useEffect(() => {
    const loadZones = async () => {
      const timeZones = (await import('./timeZones')).default;

      const filledZones = Object.entries(timeZones).reduce((finalMap, [name, offset]) => {
        finalMap[name] = `(GMT ${offset}) ${name}`;
        return finalMap;
      }, {} as TimeZoneMap);

      setZones(filledZones);
    };
    void loadZones();
  }, []);

  return zones;
};

export default useTimeZones;
