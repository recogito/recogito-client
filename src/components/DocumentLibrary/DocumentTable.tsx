import {
  Table,
  HeaderRow,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table';
import { CellSelect, type Select } from '@table-library/react-table-library/select';
import type { Translations } from 'src/Types';
import type { Theme } from '@table-library/react-table-library/theme';
import type { TableNode } from '@table-library/react-table-library/types/table';
import type {
  Column,
  //CompactTable,
} from '@table-library/react-table-library/compact';
import {
  HeaderCellSort,
  type Sort,
} from '@table-library/react-table-library/sort';
import { Virtualized } from '@table-library/react-table-library/virtualized';
import { CheckCircle } from '@phosphor-icons/react';
import { Fragment } from 'react';
import type { LibraryDocument } from './DocumentLibrary';

interface DocumentTableProps {
  data: { nodes: LibraryDocument[] };
  disabledIds: string[];
  i18n: Translations;
  select: Select<LibraryDocument>;
  theme: Theme;
  columns: Column<TableNode>[];
  sort: Sort<LibraryDocument>;
  hasRevisions?: boolean;
  selectedIds?: string[];
}

export const DocumentTable = (props: DocumentTableProps) => {
  const theme = props.theme;

  const disabled = (item: LibraryDocument) => {
    let disabled = props.disabledIds.includes(item.id);
    if (props.hasRevisions) {
      item.revisions?.forEach((n) => {
        if (props.disabledIds.includes(n.id)) {
          disabled = true;
        }
      });
    }

    return disabled;
  };

  return (
    <div style={{ height: 300 }}>
      <Table
        data={props.data}
        theme={theme}
        select={props.select}
        sort={props.sort}
        layout={{ isDiv: true, fixedHeader: true }}
      >
        {(tableList: LibraryDocument[]) => (
          <Virtualized
            tableList={tableList}
            rowHeight={40}
            header={() => (
              <HeaderRow>
                <HeaderCell />
                {props.columns.map((c, idx) => {
                  if (c.sort) {
                    return (
                      <HeaderCellSort
                        sortKey={c.sort ? c.sort?.sortKey : ''}
                        key={idx}
                      >
                        {c.label}
                      </HeaderCellSort>
                    );
                  } else {
                    return <HeaderCell key={idx}>{c.label}</HeaderCell>;
                  }
                })}
              </HeaderRow>
            )}
            body={(item: LibraryDocument) => (
              <Fragment key={item.id}>
                <Row item={item}>
                  {disabled(item) ? (
                    <Cell>
                      <CheckCircle size={24} />
                    </Cell>
                  ) : (
                    <CellSelect item={item} />
                  )}
                  {props.columns.map((c, idx) => (
                    <Cell key={idx}>{c.renderCell(item)}</Cell>
                  ))}
                </Row>
              </Fragment>
            )}
          />
        )}
      </Table>
    </div>
  );
};
