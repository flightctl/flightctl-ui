import * as React from 'react';
import { Gallery } from '@patternfly/react-core';
import { saveAs } from 'file-saver';

import { ExportFormatType, ImageBuildConditionReason, ImageExport } from '@flightctl/types/imagebuilder';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { getImageBuildStatusReason } from '../../../utils/imageBuilds';
import { RESOURCE, VERB } from '../../../types/rbac';
import { useFetch } from '../../../hooks/useFetch';
import { usePermissionsContext } from '../../common/PermissionsContext';
import { getErrorMessage } from '../../../utils/error';
import { getImageExportResource } from '../CreateImageBuildWizard/utils';
import { ImageExportAction, ViewImageBuildExportCard } from '../ImageExportCards';
import { useOciRegistriesContext } from '../OciRegistriesContext';
import { showSpinnerBriefly } from '../../../utils/time';
import { getAllExportFormats, getExportDownloadResult, getImageReference } from '../../../utils/imageBuilds';
import { useAppContext } from '../../../hooks/useAppContext';
import { ROUTE } from '../../../hooks/useNavigate';

type ImageBuildExportsGalleryProps = {
  imageBuild: ImageBuildWithExports;
  refetch: VoidFunction;
};

const REFRESH_IMAGE_BUILD_DELAY = 450;
// Delay to keep loading state while browser processes redirect
const DOWNLOAD_REDIRECT_DELAY = 1000;

const createExportAliases = ['retry', 'rebuild', 'createExport'];

const createDownloadLink = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const imageBuildExportsPermissions = [
  { kind: RESOURCE.IMAGE_EXPORT, verb: VERB.CREATE },
  { kind: RESOURCE.IMAGE_EXPORT, verb: VERB.DELETE },
  { kind: RESOURCE.IMAGE_EXPORT_LOG, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_EXPORT_DOWNLOAD, verb: VERB.GET },
  { kind: RESOURCE.IMAGE_EXPORT_CANCEL, verb: VERB.CREATE },
];

const ImageBuildExportsGallery = ({ imageBuild, refetch }: ImageBuildExportsGalleryProps) => {
  const { post, proxyFetch, remove } = useFetch();
  const { checkPermissions } = usePermissionsContext();
  const [canCreateExport, canDelete, canViewLogs, canDownload, canCancel] =
    checkPermissions(imageBuildExportsPermissions);

  const buildReason = getImageBuildStatusReason(imageBuild);

  const actionPermissions = React.useMemo(() => {
    const actions: ImageExportAction[] = [];
    if (
      buildReason === ImageBuildConditionReason.ImageBuildConditionReasonFailed ||
      buildReason === ImageBuildConditionReason.ImageBuildConditionReasonCanceled ||
      buildReason === ImageBuildConditionReason.ImageBuildConditionReasonCanceling
    ) {
      if (canDelete) {
        actions.push('delete');
      }
      return actions;
    }

    if (canCreateExport) {
      actions.push('createExport');
      actions.push('rebuild');
      actions.push('retry');
    }
    if (canDelete) {
      actions.push('delete');
    }
    if (canViewLogs) {
      actions.push('viewLogs');
    }
    if (canDownload) {
      actions.push('download');
    }
    if (canCancel) {
      actions.push('cancel');
    }
    return actions;
  }, [buildReason, canCreateExport, canDelete, canViewLogs, canDownload, canCancel]);

  const {
    router: { useNavigate: useRouterNavigate, appRoutes },
  } = useAppContext();
  const routerNavigate = useRouterNavigate();
  const [error, setError] = React.useState<{
    format: ExportFormatType;
    action: ImageExportAction;
    message: string;
  }>();
  const { ociRegistries } = useOciRegistriesContext();

  const [activeFormatAction, setActiveFormatAction] = React.useState<
    { format: ExportFormatType; action: ImageExportAction } | undefined
  >();
  const imageBuildId = imageBuild.metadata.name as string;

  const handleViewLogs = () => {
    const baseRoute = appRoutes[ROUTE.IMAGE_BUILD_DETAILS];
    routerNavigate(`${baseRoute}/${imageBuildId}/logs`);
  };

  const handleCreateNewExport = async (format: ExportFormatType) => {
    try {
      const imageExport = getImageExportResource(imageBuildId, format);
      await post<ImageExport>('imageexports', imageExport);
      // The "Export image" button wouldn't be seen as spinning without this delay.
      await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);
      refetch();
    } catch (error) {
      // If process failed, it was likely very fast, so we also add the delay in this case.
      await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);
      throw error;
    }
  };
  const handleDownload = async (ieName: string, format: ExportFormatType) => {
    const response = await proxyFetch(`imagebuilder/api/v1/imageexports/${ieName}/download`, {
      method: 'GET',
      credentials: 'include',
    });
    const downloadResult = await getExportDownloadResult(response);
    if (downloadResult === null) {
      await showSpinnerBriefly(DOWNLOAD_REDIRECT_DELAY);
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }
    if (downloadResult.type === 'redirect') {
      createDownloadLink(downloadResult.url);
      await showSpinnerBriefly(DOWNLOAD_REDIRECT_DELAY);
    } else {
      const defaultFilename = `image-export-${ieName}.${format}`;
      saveAs(downloadResult.blob, downloadResult.filename || defaultFilename);
    }
  };

  const handleCancel = async (ieName: string) => {
    await post(`imageexports/${ieName}/cancel`, {});
    await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);
    refetch();
  };

  const handleDelete = async (ieName: string) => {
    await remove(`imageexports/${ieName}`);
    await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);
    refetch();
  };

  const handleCardAction = async ({ format, action }: { format: ExportFormatType; action: ImageExportAction }) => {
    const imageExport = imageBuild.imageExports.find((ie) => ie?.spec.format === format);
    if (!imageExport && !createExportAliases.includes(action)) {
      return;
    }

    setActiveFormatAction({ format, action });
    setError(undefined);

    try {
      const ieName = imageExport?.metadata.name as string;
      switch (action) {
        case 'createExport':
        case 'retry':
        case 'rebuild':
          await handleCreateNewExport(format);
          break;
        case 'download':
          await handleDownload(ieName, format);
          break;
        case 'cancel':
          await handleCancel(ieName);
          break;
        case 'delete':
          await handleDelete(ieName);
          break;
        case 'viewLogs':
          handleViewLogs();
          break;
      }
    } catch (error) {
      setError({ format, message: getErrorMessage(error), action });
      refetch();
    } finally {
      setActiveFormatAction(undefined);
    }
  };

  return (
    <Gallery hasGutter minWidths={{ default: '350px' }}>
      {getAllExportFormats().map((format) => {
        const imageExport = imageBuild.imageExports.find((imageExport) => imageExport?.spec.format === format);
        // We can only link to the generic destination for the image build.
        // The individual export artifacts are references to this generic output image.
        const imageReference = getImageReference(ociRegistries, imageBuild.spec.destination);

        const hasError = error?.format === format;
        const activeAction = activeFormatAction?.format === format ? activeFormatAction.action : undefined;
        return (
          <ViewImageBuildExportCard
            key={format}
            imageReference={imageReference}
            format={format}
            error={hasError ? error : null}
            imageExport={imageExport}
            activeAction={activeAction}
            onDismissError={() => setError(undefined)}
            onCardAction={handleCardAction}
            actionPermissions={actionPermissions}
          />
        );
      })}
    </Gallery>
  );
};

export default ImageBuildExportsGallery;
