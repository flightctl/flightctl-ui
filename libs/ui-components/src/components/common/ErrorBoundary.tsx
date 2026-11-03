import React from 'react';
import { type TFunction, withTranslation } from 'react-i18next';
import { Alert, AlertActionLink } from '@patternfly/react-core';

import { getErrorMessage } from '../../utils/error';

interface Props {
  children?: React.ReactNode;
  t: TFunction;
}

interface State {
  hasError: boolean;
  error: Error;
  info: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<Props, State> {
  state = {
    hasError: false,
    error: { message: '', stack: '' } as Error,
    info: { componentStack: '' },
  };

  static getDerivedStateFromError = (/* error */) => {
    return { hasError: true };
  };

  componentDidCatch = (error: Error, info: React.ErrorInfo) => {
    this.setState({ error, info });
  };

  render() {
    const { hasError, error } = this.state;
    const { children, t } = this.props;
    if (!hasError && !children) {
      return null;
    }

    return hasError ? (
      <Alert
        variant="danger"
        title={t('Unexpected error occurred')}
        isInline
        actionLinks={<AlertActionLink onClick={() => window.location.reload()}>{t('Reload page')}</AlertActionLink>}
      >
        {t('Please reload the page and try again.')}
        <details>{getErrorMessage(error)}</details>
      </Alert>
    ) : (
      children
    );
  }
}

const TranslatedErrorBoundary = withTranslation()(ErrorBoundary);

export default TranslatedErrorBoundary;
