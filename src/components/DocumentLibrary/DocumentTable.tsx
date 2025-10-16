import {
  Table,
  HeaderRow,
  Row,
  HeaderCell,
  Cell,
} from '@table-library/react-table-library/table';
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
import { CheckCircle, CheckSquare, Square } from '@phosphor-icons/react';
import { Fragment, useEffect, useState } from 'react';
import { useTree, CellTree } from '@table-library/react-table-library/tree';
import type { LibraryDocument } from './DocumentLibrary';

interface DocumentTableProps {
  data: { nodes: LibraryDocument[] };
  disabledIds: string[];
  i18n: Translations;
  theme: Theme;
  columns: Column<TableNode>[];
  sort: Sort<LibraryDocument>;
  hasRevisions?: boolean;
  selectedIds?: string[];
  onSelectChange(id: string): void;
  hasGroups?: boolean;
}

interface TableDocument extends LibraryDocument {
  nodes?: LibraryDocument[];
}

export const DocumentTable = (props: DocumentTableProps) => {
  const [data, setData] = useState<TableDocument[]>([]);

  const theme = props.theme;
  const { t } = props.i18n;

  useEffect(() => {
    if (props.data) {
      if (!props.hasGroups) {
        setData(props.data.nodes);
      } else {
        const nodes: TableDocument[] = [];
        props.data.nodes
          .filter(
            (n) =>
              n.is_document_group ||
              !n.document_group_id ||
              n.document_group_id === ''
          )
          .forEach((n) => {
            nodes.push({
              ...n,
              nodes: n.is_document_group ? [] : undefined,
            });
          });

        props.data.nodes
          .filter((n) => n.document_group_id)
          .forEach((n) => {
            const idx = nodes.findIndex((no) => no.id === n.document_group_id);
            if (idx > -1) {
              nodes[idx].nodes?.push(n);
            }
          });

        setData(nodes);
      }
    }
  }, [props.data, props.hasGroups]);

  const tree = useTree(
    // @ts-ignore
    { nodes: data },
    {},
    {
      treeYLevel: 2,
    }
  );

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
    <Table
      data={{ nodes: data }}
      theme={theme}
      sort={props.sort}
      tree={tree}
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
                ) : props.selectedIds?.includes(item.id) ? (
                  <Cell>
                    <CheckSquare
                      size={24}
                      fill='#0c529c'
                      onClick={() => props.onSelectChange(item.id)}
                    />
                  </Cell>
                ) : (
                  <Cell>
                    <Square
                      size={24}
                      onClick={() => props.onSelectChange(item.id)}
                    />
                  </Cell>
                )}
                {props.columns.map((c, idx) =>
                  c.label === t['Title'] ? (
                    <CellTree item={item} key={idx}>
                      {c.renderCell(item)}
                    </CellTree>
                  ) : (
                    <Cell key={idx}>{c.renderCell(item)}</Cell>
                  )
                )}
              </Row>
            </Fragment>
          )}
        />
      )}
    </Table>
  );
};
