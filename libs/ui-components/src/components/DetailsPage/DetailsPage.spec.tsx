import * as React from 'react';

import { checkAccessibility, render, screen } from '../../tests/test-utils';

import DetailsPage, { type DetailsPageProps } from './DetailsPage';
import { Button } from '@patternfly/react-core';

const baseProps: DetailsPageProps = {
  id: 'device-id',
  title: 'MyTitle',
  children: null,
  error: null,
  loading: false,
  resourceLink: '/devicemanagement/devices',
  resourceType: 'Devices',
  resourceTypeLabel: 'Devices',
  actions: undefined,
  nav: undefined,
};

describe('Details page', () => {
  it('is accessible', async () => {
    const { container } = render(<DetailsPage {...baseProps}>Content</DetailsPage>);

    await checkAccessibility(container);
  });

  describe('loading state', () => {
    it('Shows a spinner and not the content when data is loading', () => {
      render(
        <DetailsPage {...baseProps} loading>
          Content
        </DetailsPage>,
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('Shows the content and not the spinner when it is not loading', () => {
      render(<DetailsPage {...baseProps}>Content</DetailsPage>);

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('when in error state', () => {
    const error = new Error('something bad happened');
    it('shows the error message', () => {
      render(
        <DetailsPage {...baseProps} error={error}>
          Content
        </DetailsPage>,
      );

      expect(screen.getByText('Failed to retrieve resource details')).toBeInTheDocument();
      expect(screen.getByText('something bad happened')).toBeInTheDocument();
    });

    it('does not show the content', () => {
      render(
        <DetailsPage {...baseProps} error={error}>
          Content
        </DetailsPage>,
      );

      expect(screen.getByText('something bad happened')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });

    it('shows PageNotFound if error is 404', () => {
      const error404 = new Error('Error 404: Not Found');
      render(
        <DetailsPage {...baseProps} error={error404}>
          Content
        </DetailsPage>,
      );

      expect(screen.getByText('Device not found')).toBeInTheDocument();
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Content', () => {
    it('shows a link to the parent section', () => {
      render(<DetailsPage {...baseProps}>Content</DetailsPage>);

      expect(screen.getByRole('link')).toHaveTextContent('Devices');
      expect(screen.getByRole('link')).toHaveAttribute('href', '/devicemanagement/devices');
    });

    it('shows the title over the id', () => {
      render(
        <DetailsPage {...baseProps} title="MyTitle" id="device-id">
          Content
        </DetailsPage>,
      );

      expect(screen.getByRole('heading')).toHaveTextContent('MyTitle');
      expect(screen.queryByText('device-id')).not.toBeInTheDocument();
    });

    it('shows the id when the title is missing', () => {
      render(
        <DetailsPage {...baseProps} title="" id="device-id">
          Content
        </DetailsPage>,
      );

      expect(screen.getByRole('heading')).toHaveTextContent('device-id');
    });
  });

  describe('Actions', () => {
    it('shows the actions', () => {
      const action = <Button variant="primary">Some action</Button>;
      render(
        <DetailsPage {...baseProps} actions={action}>
          Content
        </DetailsPage>,
      );

      expect(screen.getByText('Some action')).toBeInTheDocument();
    });
  });
});
