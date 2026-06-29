import * as React from 'react';
import debounce from 'lodash/debounce';

import { useTranslation } from '../../hooks/useTranslation';
import { useFetch } from '../../hooks/useFetch';
import StatusDisplay from '../Status/StatusDisplay';

type SourceImageValidationProps = {
  repository: string;
  imageName: string;
  imageTag: string;
};

const SourceImageValidation = ({ repository, imageName, imageTag }: SourceImageValidationProps) => {
  const { t } = useTranslation();
  const { post } = useFetch();
  const [response, setResponse] = React.useState<{ accessible: boolean; errorCode?: number; errorMessage?: string }>();
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController>();

  const sourceDefined = !!imageName && !!repository && !!imageTag;

  const checkAccessibility = React.useCallback(
    async (isSourceDefined: boolean, repo: string, name: string, tag: string) => {
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      if (isSourceDefined) {
        try {
          const resp = await post<unknown, { accessible: boolean; errorCode?: number; errorMessage?: string }>(
            `repositories/${repo}/check-oci-tag`,
            { imageName: name, tag },
            abortController.signal,
          );
          setResponse(resp);
        } catch {
          if (abortController.signal.aborted) {
            return;
          }
          setResponse({ accessible: false });
        } finally {
          setIsLoading(false);
        }
      }
    },
    [post],
  );

  // A single stable debounced wrapper; recreated only when checkAccessibility changes (i.e. when post changes).
  const debouncedCheck = React.useMemo(() => debounce(checkAccessibility, 1000), [checkAccessibility]);

  React.useEffect(() => {
    setIsLoading(true);
    abortControllerRef.current?.abort();
    void debouncedCheck(sourceDefined, repository, imageName, imageTag);
    return () => {
      debouncedCheck.cancel();
      abortControllerRef.current?.abort();
    };
  }, [imageName, repository, imageTag, debouncedCheck, sourceDefined]);

  if (!sourceDefined) {
    return null;
  }

  if (isLoading) {
    return <StatusDisplay item={{ label: t('Checking image availability'), level: 'info' }} />;
  }

  return response?.accessible ? (
    <StatusDisplay item={{ label: t('Available'), level: 'success' }} />
  ) : (
    <StatusDisplay
      item={{ label: t('Not available'), level: 'warning' }}
      message={
        response?.errorCode || response?.errorMessage ? `${response?.errorCode}: ${response?.errorMessage}` : undefined
      }
    />
  );
};

export default SourceImageValidation;
