import * as React from 'react';
import { Gallery } from '@patternfly/react-core';
import { saveAs } from 'file-saver';

import { ExportFormatType, ImageExport } from '@flightctl/types/imagebuilder';
import { ImageBuildWithExports } from '../../../types/extraTypes';
import { useFetch } from '../../../hooks/useFetch';
import { getErrorMessage } from '../../../utils/error';
import { getImageExportResource } from '../CreateImageBuildWizard/utils';
import { ViewImageBuildExportCard } from '../ImageExportCards';
import { useOciRegistriesContext } from '../OciRegistriesContext';
import { showSpinnerBriefly } from '../../../utils/time';
import { getAllExportFormats, getExportDownloadResult, getImageReference } from '../../../utils/imageBuilds';

type ImageBuildExportsGalleryProps = {
  imageBuild: ImageBuildWithExports;
  refetch: VoidFunction;
};

const REFRESH_IMAGE_BUILD_DELAY = 450;
// Delay to keep loading state while browser processes redirect
const DOWNLOAD_REDIRECT_DELAY = 1000;

const createDownloadLink = (url: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const ImageBuildExportsGallery = ({ imageBuild, refetch }: ImageBuildExportsGalleryProps) => {
  const { post, proxyFetch } = useFetch();
  const [error, setError] = React.useState<{
    format: ExportFormatType;
    message: string;
    mode: 'export' | 'download';
  }>();
  const { ociRegistries } = useOciRegistriesContext();
  const [exportingFormat, setExportingFormat] = React.useState<ExportFormatType>();
  const [downloadingFormat, setDownloadingFormat] = React.useState<ExportFormatType>();
  const imageBuildId = imageBuild.metadata.name as string;

  const handleExportImage = async (format: ExportFormatType) => {
    setExportingFormat(format);
    setError(undefined);
    try {
      const imageExport = getImageExportResource(imageBuildId, format);
      await post<ImageExport>('imageexports', imageExport);
      // The "Export image" button wouldn't be seen as spinning without this delay.
      await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);
      refetch();
    } catch (error) {
      // If process failed, it was likely very fast, so we also add the delay in this case.
      await showSpinnerBriefly(REFRESH_IMAGE_BUILD_DELAY);

      setError({ format, message: getErrorMessage(error), mode: 'export' });
    } finally {
      setExportingFormat(undefined);
    }
  };

  const handleDownload = async (format: ExportFormatType) => {
    const imageExport = imageBuild.imageExports.find((ie) => ie?.spec.format === format);
    if (!imageExport) {
      return;
    }

    setDownloadingFormat(format);
    try {
      const ieName = imageExport.metadata.name as string;
      const downloadEndpoint = `imagebuilder/api/v1/imageexports/${ieName}/download`;
      const response = await proxyFetch(downloadEndpoint, {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual', // Prevent automatic redirect following to avoid CORS issues
      });

      const downloadResult = await getExportDownloadResult(response);
      if (downloadResult === null) {
        await showSpinnerBriefly(DOWNLOAD_REDIRECT_DELAY);
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      } else if (downloadResult.type === 'redirect') {
        createDownloadLink(downloadResult.url);
        await showSpinnerBriefly(DOWNLOAD_REDIRECT_DELAY);
      } else {
        const defaultFilename = `image-export-${ieName}.${format}`;
        saveAs(downloadResult.blob, downloadResult.filename || defaultFilename);
      }
    } catch (err) {
      setError({ format, message: getErrorMessage(err), mode: 'download' });
    } finally {
      setDownloadingFormat(undefined);
    }
  };

  return (
    <Gallery hasGutter minWidths={{ default: '350px' }}>
      {getAllExportFormats().map((format) => {
        const imageExport = imageBuild.imageExports.find((imageExport) => imageExport?.spec.format === format);
        const isDisabled = exportingFormat && exportingFormat !== format;
        // We can only link to the generic destination for the image build.
        // The individual export artifacts are references to this generic output image.
        const imageReference = getImageReference(ociRegistries, imageBuild.spec.destination);

        const hasError = error?.format === format;
        return (
          <ViewImageBuildExportCard
            imageBuildId={imageBuildId}
            key={format}
            imageReference={imageReference}
            format={format}
            error={hasError ? error : null}
            imageExport={imageExport}
            isCreating={exportingFormat === format}
            isDownloading={downloadingFormat === format}
            isDisabled={isDisabled}
            onDismissError={() => setError(undefined)}
            onExportImage={handleExportImage}
            onDownload={handleDownload}
          />
        );
      })}
    </Gallery>
  );
};

export default ImageBuildExportsGallery;
