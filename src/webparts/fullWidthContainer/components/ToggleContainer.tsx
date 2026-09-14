/**
 * @file ToggleContainer.tsx
 * @description Interactive segmented toggle layout for Content Sections.
 * Allows instant segment switching across sections with high-density card display.
 * Adheres to the Microsoft Fluent UI 2 Design System and supports any column width.
 */

import * as React from 'react';
import { IContainerSection } from '../models/IContainerModels';
import { BlockRenderer } from './BlockRenderer';
import {
  TabList,
  Tab,
  Badge,
  Button,
  SelectTabData,
  SelectTabEvent,
  TabValue,
  makeStyles,
  shorthands,
  tokens,
  Body1
} from '@fluentui/react-components';
import {
  InfoRegular,
  AddRegular,
  EditRegular,
  DeleteRegular
} from '@fluentui/react-icons';
import { SectionEditDialog } from './SectionEditDialog';
import { ComposableContentSection } from './ComposableContentSection';
import { renderUnifiedIcon } from './CustomSvgIconRegistry';
import { IAssetPickerService } from '../services/IAssetPickerService';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    boxSizing: 'border-box'
  },
  toggleHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    ...shorthands.borderBottom('1px', 'solid', tokens.colorNeutralStroke2),
    paddingBottom: '10px',
    marginBottom: '16px',
    gap: '12px'
  },
  toggleSegmentGroup: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.padding('4px'),
    ...shorthands.borderRadius(tokens.borderRadiusMedium),
    ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
    maxWidth: '100%',
    overflowX: 'auto',
    scrollbarWidth: 'thin'
  },
  toggleTabList: {
    '& .fui-Tab': {
      ...shorthands.borderRadius(tokens.borderRadiusSmall),
      paddingTop: '6px',
      paddingBottom: '6px',
      paddingLeft: '14px',
      paddingRight: '14px',
      fontWeight: 600,
      fontSize: '0.9rem',
      transitionProperty: 'all',
      transitionDuration: '150ms'
    },
    '& .fui-Tab[aria-selected="true"]': {
      backgroundColor: '#FFFFFF',
      color: tokens.colorBrandForeground1,
      boxShadow: tokens.shadow4
    }
  },
  toggleActionsRow: {
    display: 'flex',
    alignItems: 'center',
    ...shorthands.gap(tokens.spacingHorizontalXXS),
    flexShrink: 0
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    ...shorthands.gap(tokens.spacingHorizontalL),
    width: '100%'
  },
  addCardRow: {
    width: '100%',
    marginTop: tokens.spacingVerticalS
  },
  addCardButton: {
    minHeight: '80px',
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.border('2px', 'dashed', tokens.colorBrandStroke2),
    ...shorthands.borderRadius(tokens.borderRadiusLarge),
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorBrandForeground1,
    cursor: 'pointer',
    ...shorthands.gap(tokens.spacingHorizontalS),
    transitionProperty: 'border-color, background-color',
    transitionDuration: '150ms',
    ':hover': {
      ...shorthands.borderColor(tokens.colorBrandBackground),
      backgroundColor: tokens.colorBrandBackground2
    }
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    ...shorthands.padding(tokens.spacingVerticalXXL),
    color: tokens.colorNeutralForeground3
  },
  badge: {
    whiteSpace: 'nowrap',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '6px'
  }
});

export interface IToggleContainerProps {
  sections: IContainerSection[];
  searchQuery?: string;
  selectedFilterTerms?: Record<string, string>;
  gridColumns?: number;
  gridRows?: number;
  cardHeightMode?: 'auto' | 'equal';
  isEditMode?: boolean;
  onUpdateBlock?: (sectionId: string, blockId: string, fields: any) => void;
  onDeleteBlock?: (sectionId: string, blockId: string) => void;
  onAddBlock?: (sectionId: string) => void;
  onEditBlockProperties?: (sectionIndex: number, blockIndex: number) => void;
  onAddSection?: () => void;
  onUpdateSection?: (sectionId: string, fields: Partial<IContainerSection>) => void;
  onDeleteSection?: (sectionId: string) => void;
  assetPickerService?: IAssetPickerService;
}

export const ToggleContainer: React.FC<IToggleContainerProps> = ({
  sections,
  searchQuery = '',
  selectedFilterTerms = {},
  gridColumns = 0,
  gridRows = 0,
  cardHeightMode = 'auto',
  isEditMode = false,
  onUpdateBlock,
  onDeleteBlock,
  onAddBlock,
  onEditBlockProperties,
  onAddSection,
  onUpdateSection,
  onDeleteSection,
  assetPickerService
}) => {
  const styles = useStyles();
  const [selectedSectionId, setSelectedSectionId] = React.useState<TabValue>(() =>
    sections.length > 0 ? sections[0].id : ''
  );
  const [isSectionDialogOpen, setIsSectionDialogOpen] = React.useState<boolean>(false);
  const [editingSection, setEditingSection] = React.useState<IContainerSection | undefined>(undefined);
  const [activeItemFilter, setActiveItemFilter] = React.useState<string>('');

  React.useEffect(() => {
    if (sections.length > 0 && (!selectedSectionId || !sections.some((s) => s.id === selectedSectionId))) {
      setSelectedSectionId(sections[0].id);
    }
  }, [sections, selectedSectionId]);

  React.useEffect(() => {
    const handleCardFilterApply = (e: Event): void => {
      const ce = e as CustomEvent<{ sourceItemId: string; filterValue: string }>;
      setActiveItemFilter(ce.detail?.filterValue || '');
    };
    window.addEventListener('dashboard:card-filter-apply', handleCardFilterApply);
    return () => {
      window.removeEventListener('dashboard:card-filter-apply', handleCardFilterApply);
    };
  }, []);

  const handleSelectToggle = (event: SelectTabEvent, data: SelectTabData): void => {
    setSelectedSectionId(data.value);
  };

  if (!sections || sections.length === 0) {
    return (
      <div className={styles.emptyState}>
        <InfoRegular fontSize={24} />
        <Body1>No sections configured.</Body1>
      </div>
    );
  }

  const activeSectionIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === selectedSectionId)
  );
  const activeSection = sections[activeSectionIndex] || sections[0];

  // Filter blocks by search query AND active term store dropdown filters AND interactive item filter
  const q = searchQuery ? searchQuery.toLowerCase().trim() : '';
  const itemFilt = activeItemFilter ? activeItemFilter.toLowerCase().trim() : '';
  const blocks = (activeSection && Array.isArray(activeSection.blocks)) ? activeSection.blocks : [];

  const filteredBlocks = blocks.filter((b) => {
    const isFilterHost = b.items && b.items.some((it) => it.type === 'filterButtons' || it.type === 'processModel' || it.type === 'dropdown');

    // 1. Interactive Button / Process Stage / Multi-Dropdown Filter Matching
    if (itemFilt && !isFilterHost) {
      const filterTokens = itemFilt.split(/\s+/).filter((t) => t.length > 0);
      const matchesAllTokens = filterTokens.every((token) => {
        const titleMatch = b.title ? b.title.toLowerCase().indexOf(token) !== -1 : false;
        const descMatch = b.description ? b.description.toLowerCase().indexOf(token) !== -1 : false;
        const badgeMatch = b.badge ? b.badge.toLowerCase().indexOf(token) !== -1 : false;
        const tagMatch = b.tags && Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().indexOf(token) !== -1);
        const termStoreMatch = b.termStoreTags && Array.isArray(b.termStoreTags) && b.termStoreTags.some((t) => {
          const labelMatch = t.label ? t.label.toLowerCase().indexOf(token) !== -1 : false;
          const setMatch = t.termSetName ? t.termSetName.toLowerCase().indexOf(token) !== -1 : false;
          return labelMatch || setMatch;
        });
        const innerItemsMatch = b.items && Array.isArray(b.items) && b.items.some((item) => {
          const textMatch = item.text ? item.text.toLowerCase().indexOf(token) !== -1 : false;
          const ctaMatch = item.ctaHeading ? item.ctaHeading.toLowerCase().indexOf(token) !== -1 : false;
          const btnMatch = item.buttonLabel ? item.buttonLabel.toLowerCase().indexOf(token) !== -1 : false;
          return textMatch || ctaMatch || btnMatch;
        });

        return titleMatch || descMatch || badgeMatch || tagMatch || termStoreMatch || innerItemsMatch;
      });

      if (!matchesAllTokens) return false;
    }

    // 2. Free-text Search Query Matching
    if (q) {
      const titleMatch = b.title ? b.title.toLowerCase().indexOf(q) !== -1 : false;
      const descMatch = b.description ? b.description.toLowerCase().indexOf(q) !== -1 : false;
      const badgeMatch = b.badge ? b.badge.toLowerCase().indexOf(q) !== -1 : false;
      const tagMatch = b.tags && Array.isArray(b.tags) && b.tags.some((t) => t.toLowerCase().indexOf(q) !== -1);
      const termStoreMatch = b.termStoreTags && Array.isArray(b.termStoreTags) && b.termStoreTags.some((t) => {
        const labelMatch = t.label ? t.label.toLowerCase().indexOf(q) !== -1 : false;
        const setMatch = t.termSetName ? t.termSetName.toLowerCase().indexOf(q) !== -1 : false;
        return labelMatch || setMatch;
      });
      const innerItemsMatch = b.items && Array.isArray(b.items) && b.items.some((item) => {
        const textMatch = item.text ? item.text.toLowerCase().indexOf(q) !== -1 : false;
        const ctaMatch = item.ctaHeading ? item.ctaHeading.toLowerCase().indexOf(q) !== -1 : false;
        const btnMatch = item.buttonLabel ? item.buttonLabel.toLowerCase().indexOf(q) !== -1 : false;
        return textMatch || ctaMatch || btnMatch;
      });

      if (!titleMatch && !descMatch && !badgeMatch && !tagMatch && !termStoreMatch && !innerItemsMatch) {
        return false;
      }
    }

    // 3. Term Store Dropdown Filters
    const dropdownKeys = Object.keys(selectedFilterTerms);
    if (dropdownKeys.length > 0) {
      const matchesAllDropdowns = dropdownKeys.every((key) => {
        const target = selectedFilterTerms[key]?.toLowerCase().trim();
        if (!target) return true;
        return b.termStoreTags && b.termStoreTags.some((tag) => {
          return (
            (tag.label && tag.label.toLowerCase().includes(target)) ||
            (tag.termSetName && tag.termSetName.toLowerCase().includes(target)) ||
            (tag.path && tag.path.toLowerCase().includes(target))
          );
        });
      });

      if (!matchesAllDropdowns) return false;
    }

    return true;
  });

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns:
      gridColumns && gridColumns > 0
        ? `repeat(${gridColumns}, 1fr)`
        : 'repeat(auto-fill, minmax(320px, 1fr))',
    ...(activeSection?.backgroundColor
      ? {
          backgroundColor: activeSection.backgroundColor,
          padding: '16px',
          borderRadius: '8px'
        }
      : {}),
    ...(activeSection?.backgroundImage
      ? {
          backgroundImage: `url("${activeSection.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '16px',
          borderRadius: '8px'
        }
      : {})
  };

  const renderSectionIcon = (section: IContainerSection): React.ReactElement | undefined => {
    if (!section.iconName) return undefined;
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: section.showIconBackground ? (section.iconBackgroundColor || tokens.colorBrandBackground2) : 'transparent',
          color: section.iconColor || tokens.colorBrandForeground1,
          borderRadius: '4px',
          padding: section.showIconBackground ? '2px 4px' : '0'
        }}
      >
        {renderUnifiedIcon(section.iconName, section.iconColor)}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {/* Segmented Toggle Control Header */}
      <div className={styles.toggleHeaderRow}>
        <div className={styles.toggleSegmentGroup}>
          <TabList
            selectedValue={selectedSectionId}
            onTabSelect={handleSelectToggle}
            size="medium"
            appearance="subtle"
            className={styles.toggleTabList}
          >
            {sections.map((section) => (
              <Tab
                key={section.id}
                value={section.id}
                icon={renderSectionIcon(section)}
              >
                {section.title}
                {section.badge && (
                  <Badge appearance="filled" size="small" className={styles.badge}>
                    {section.badge}
                  </Badge>
                )}
              </Tab>
            ))}
          </TabList>
        </div>

        {/* Edit / Delete Section Action Buttons in authoring mode */}
        {isEditMode && activeSection && (
          <div className={styles.toggleActionsRow}>
            <Button
              size="small"
              appearance="subtle"
              icon={<EditRegular />}
              title={`Edit active section properties (${activeSection.title})`}
              onClick={(e) => {
                e.stopPropagation();
                setEditingSection(activeSection);
                setIsSectionDialogOpen(true);
              }}
            >
              Edit section
            </Button>

            {sections.length > 1 && onDeleteSection && (
              <Button
                size="small"
                appearance="subtle"
                icon={<DeleteRegular />}
                title={`Delete active section (${activeSection.title})`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete section "${activeSection.title}"?`)) {
                    onDeleteSection(activeSection.id);
                  }
                }}
              />
            )}

            {onAddSection && (
              <Button
                size="small"
                appearance="subtle"
                icon={<AddRegular />}
                title="Add new section"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddSection();
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Section Edit Side Dialog */}
      <SectionEditDialog
        isOpen={isSectionDialogOpen}
        section={editingSection}
        canDelete={sections.length > 1}
        assetPickerService={assetPickerService}
        onSave={(updated) => {
          if (editingSection && onUpdateSection) {
            onUpdateSection(editingSection.id, updated);
          }
        }}
        onDelete={() => {
          if (editingSection && onDeleteSection) {
            onDeleteSection(editingSection.id);
          }
        }}
        onDismiss={() => {
          setIsSectionDialogOpen(false);
          setEditingSection(undefined);
        }}
      />

      {/* Section Top Content Area (composable content items above section cards) */}
      {activeSection && (
        <ComposableContentSection
          items={activeSection.topContentItems || []}
          isEditMode={isEditMode}
          contextTitle={`Add content to section "${activeSection.title}"`}
          assetPickerService={assetPickerService}
          onUpdateItems={(newItems) => {
            if (onUpdateSection) {
              onUpdateSection(activeSection.id, { topContentItems: newItems });
            }
          }}
        />
      )}

      {/* Cards Grid */}
      <div className={styles.grid} style={gridStyle}>
        {filteredBlocks.map((block, blkIdx) => (
          <BlockRenderer
            key={block.id}
            block={block}
            containerGridColumns={gridColumns}
            containerGridRows={gridRows}
            containerCardHeightMode={cardHeightMode}
            isEditMode={isEditMode}
            onUpdate={(fields) => {
              if (activeSection && onUpdateBlock) {
                onUpdateBlock(activeSection.id, block.id, fields);
              }
            }}
            onDelete={() => {
              if (activeSection && onDeleteBlock) {
                onDeleteBlock(activeSection.id, block.id);
              }
            }}
            onEditProperties={() => {
              if (onEditBlockProperties) {
                onEditBlockProperties(activeSectionIndex, blkIdx);
              }
            }}
            assetPickerService={assetPickerService}
          />
        ))}
      </div>

      {/* Quick Add Card Action in Edit Mode */}
      {isEditMode && activeSection && onAddBlock && (
        <div className={styles.addCardRow}>
          <div
            className={styles.addCardButton}
            onClick={() => onAddBlock(activeSection.id)}
            title="Add a new card to this section"
          >
            <AddRegular fontSize={20} />
            <Body1 style={{ fontWeight: 600 }}>Add new card</Body1>
          </div>
        </div>
      )}

      {filteredBlocks.length === 0 && !isEditMode && (
        <div className={styles.emptyState}>
          <InfoRegular fontSize={24} />
          <Body1>No content items found matching &quot;{searchQuery}&quot; in this section.</Body1>
        </div>
      )}
    </div>
  );
};
