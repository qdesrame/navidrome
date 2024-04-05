import React, {useMemo, useState} from 'react'
import {
  Datagrid,
  DatagridBody,
  DatagridRow,
  DateField, FunctionField,
  NumberField,
  TextField,
} from 'react-admin'
import { useMediaQuery } from '@material-ui/core'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import { makeStyles } from '@material-ui/core/styles'
import { useDrag } from 'react-dnd'
import {
  ArtistLinkField,
  DurationField,
  RangeField,
  SimpleList,
  AlbumContextMenu,
  RatingField,
  useSelectedFields,
  SizeField,
} from '../common'
import config from '../config'
import { DraggableTypes } from '../consts'

const useStyles = makeStyles({
  columnIcon: {
    marginLeft: '3px',
    marginTop: '-2px',
    verticalAlign: 'text-top',
  },
  row: {
    '&:hover': {
      '& $contextMenu': {
        visibility: 'visible',
      },
      '& $ratingField': {
        visibility: 'visible',
      },
    },
  },
  tableCell: {
    width: '17.5%',
  },
  contextMenu: {
    visibility: 'hidden',
  },
  ratingField: {
    visibility: 'hidden',
  },
})

const AlbumDatagridRow = (props) => {
  const { record } = props
  const [, dragAlbumRef] = useDrag(
    () => ({
      type: DraggableTypes.ALBUM,
      item: { albumIds: [record?.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )
  return <DatagridRow ref={dragAlbumRef} {...props} onContextMenu={props.rightClickMenu(record)}/>
}

const AlbumDatagridBody = (props) => (
  <DatagridBody {...props} row={<AlbumDatagridRow rightClickMenu={props.rightClickMenu}/>} />
)

const AlbumDatagrid = (props) => (
  <Datagrid {...props} body={<AlbumDatagridBody rightClickMenu={props.rightClickMenu}/>} />
)

const AlbumTableView = ({
  hasShow,
  hasEdit,
  hasList,
  syncWithLocation,
  ...rest
}) => {
  const classes = useStyles()
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'))
  const isXsmall = useMediaQuery((theme) => theme.breakpoints.down('xs'))

  const toggleableFields = useMemo(() => {
    return {
      artist: <ArtistLinkField source="albumArtist" />,
      songCount: isDesktop && (
        <NumberField source="songCount" sortByOrder={'DESC'} />
      ),
      playCount: isDesktop && (
        <NumberField source="playCount" sortByOrder={'DESC'} />
      ),
      year: (
        <RangeField source={'year'} sortBy={'max_year'} sortByOrder={'DESC'} />
      ),
      duration: isDesktop && <DurationField source="duration" />,
      size: isDesktop && <SizeField source="size" />,
      rating: config.enableStarRating && (
        <RatingField
          source={'rating'}
          resource={'album'}
          sortByOrder={'DESC'}
          className={classes.ratingField}
        />
      ),
      createdAt: isDesktop && <DateField source="createdAt" showTime />,
    }
  }, [classes.ratingField, isDesktop])

  const [rightClickAnchorPosition, setRightClickAnchorPosition] = useState(null)
  const handleContextMenu = (record) => (event) => {
    event.preventDefault()

    setRightClickAnchorPosition({
      record,
      top: event.clientY,
      left: event.clientX,
    })
  }
  const handleClose = () => {
    setRightClickAnchorPosition(null)
  }

  const columns = useSelectedFields({
    resource: 'album',
    columns: toggleableFields,
    defaultOff: ['createdAt'],
  })

  return isXsmall ? (
    <SimpleList
      primaryText={(r) => r.name}
      secondaryText={(r) => (
        <>
          {r.albumArtist}
          {config.enableStarRating && (
            <>
              <br />
              <RatingField
                record={r}
                sortByOrder={'DESC'}
                source={'rating'}
                resource={'album'}
                size={'small'}
              />
            </>
          )}
        </>
      )}
      tertiaryText={(r) => (
        <>
          <RangeField record={r} source={'year'} sortBy={'max_year'} />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        </>
      )}
      linkType={'show'}
      rightIcon={(r) => <AlbumContextMenu record={r} anchorPosition={rightClickAnchorPosition} onClose={handleClose}/>}
      {...rest}
    />
  ) : (
    <AlbumDatagrid rowClick={'show'} rightClickMenu={handleContextMenu} classes={{ row: classes.row }} {...rest}>
      <TextField source="name" onContextMenu={handleContextMenu}/>
      {columns}
      <FunctionField label="icon" render={record => <p>{record.name}</p> } />
      <AlbumContextMenu
        source={'starred'}
        sortBy={'starred ASC, starredAt ASC'}
        sortByOrder={'DESC'}
        sortable={config.enableFavourites}
        className={classes.contextMenu}
        label={
          config.enableFavourites && (
            <FavoriteBorderIcon
              fontSize={'small'}
              className={classes.columnIcon}
            />
          )
        }
        anchorPosition={rightClickAnchorPosition}
        onClose={handleClose}
      />
    </AlbumDatagrid>
  )
}

export default AlbumTableView
