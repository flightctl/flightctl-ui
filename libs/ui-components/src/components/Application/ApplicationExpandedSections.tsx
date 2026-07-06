import * as React from 'react';
import {
  DataList,
  DataListCell,
  DataListContent,
  DataListItem,
  DataListItemCells,
  DataListItemRow,
  DataListToggle,
} from '@patternfly/react-core';

export type ApplicationDetailSection = {
  id: string;
  title: string;
  summary: React.ReactNode;
  content: React.ReactNode;
  contentAriaLabel: string;
  toggleAriaLabel: string;
  contentHasNoPadding?: boolean;
};

type ApplicationExpandedSectionsProps = {
  name: string;
  ariaLabel: string;
  sections: ApplicationDetailSection[];
};

const ApplicationExpandedSections = ({ name, ariaLabel, sections }: ApplicationExpandedSectionsProps) => {
  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({});

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (sections.length === 0) {
    return null;
  }

  if (sections.length === 1) {
    return sections[0].content;
  }

  return (
    <DataList aria-label={ariaLabel} isCompact>
      {sections.map((section) => {
        const sectionId = `${name}-${section.id}`;
        const isExpanded = expandedSections[sectionId];

        return (
          <DataListItem key={section.id} aria-labelledby={`${sectionId}-title`} isExpanded={isExpanded}>
            <DataListItemRow>
              <DataListToggle
                id={`${sectionId}-toggle`}
                onClick={() => toggleSection(sectionId)}
                isExpanded={isExpanded}
                aria-label={section.toggleAriaLabel}
              />
              <DataListItemCells
                dataListCells={[
                  <DataListCell key="title" width={2}>
                    <span id={`${sectionId}-title`}>{section.title}</span>
                  </DataListCell>,
                  <DataListCell key="summary" width={4}>
                    {section.summary}
                  </DataListCell>,
                ]}
              />
            </DataListItemRow>
            <DataListContent
              aria-label={section.contentAriaLabel}
              id={`${sectionId}-content`}
              isHidden={!isExpanded}
              hasNoPadding={section.contentHasNoPadding}
            >
              {section.content}
            </DataListContent>
          </DataListItem>
        );
      })}
    </DataList>
  );
};

export default ApplicationExpandedSections;
