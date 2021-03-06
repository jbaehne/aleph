import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import truncateText from 'truncate';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import c from 'classnames';

import { Schema } from 'src/components/common';
import getPath from 'src/util/getPath';
import togglePreview from 'src/util/togglePreview';
import { fetchEntity } from 'src/actions';
import { selectEntity } from 'src/selectors';

import './Entity.scss';


class EntityLabel extends Component {
  shouldComponentUpdate(nextProps) {
    const { entity = {} } = this.props;
    const { entity: nextEntity = {} } = nextProps;
    return entity.id !== nextEntity.id;
  }

  render() {
    const { entity, icon = false, documentMode = false, truncate } = this.props;
    if (entity === undefined) {
      return null;
    }
    let { title, name: entityName, file_name: fileName, schema } = entity;
    
    // Trim names *before* checking to see which ones look okay to use
    title = title ? title.trim() : null;
    entityName = entityName ? entityName.trim() : null;
    fileName = fileName ? fileName.trim() : null;
    
    let text = title || entityName || fileName;

    if (truncate) {
      text = truncateText(text, truncate);
    }

    if (documentMode) {
      text = fileName || text;
    }

    let entityClassName = entity.status === 'pending' ? 'EntityLabel disabled' : 'EntityLabel';

    if (!text || !text.length || text.length < 1) {
      return (
        <span className='EntityLabel untitled'>
          {icon && <Schema.Icon schema={schema} />}
          {icon && ' '}
          <FormattedMessage id='entity.label.missing' defaultMessage="Untitled" />
        </span>
      );
    }
    
    return (
      <span className={entityClassName} title={title || entityName}>
        {icon && <Schema.Icon schema={schema}/>}
        {icon && ' '}
        {text}
      </span>
    );
  }
}

class EntityLink extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick(event) {
    const { entity, history, preview } = this.props;
    if (preview) {
      const isDocument = entity.schemata.indexOf('Document') !== -1;
      const previewType = isDocument ? 'document' : 'entity';
      event.preventDefault();
      togglePreview(history, entity, previewType);
    }
  };

  render() {
    const { entity, className } = this.props;
    if (!entity || !entity.links || !entity.schemata || entity.status === 'pending') {
      return <Entity.Label {...this.props} />;
    }

    const link = getPath(entity.links.ui);
    return (
      <Link to={link} onClick={this.onClick} className={c('EntityLink', className)}>
        <Entity.Label {...this.props} />
      </Link>
    );
  }
}

EntityLink = withRouter(EntityLink);


class EntityLoad extends Component {
  componentDidMount() {
    this.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    this.fetchIfNeeded();
  }

  fetchIfNeeded() {
    const { id, entity } = this.props;
    if (entity.shouldLoad) {
      this.props.fetchEntity({ id });
    }
  }

  render() {
    const { entity, children, renderWhenLoading } = this.props;
    if (entity.isLoading && renderWhenLoading !== undefined) {
      return renderWhenLoading;
    } else {
      return children(entity);
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  entity: selectEntity(state, ownProps.id),
});
EntityLoad = connect(mapStateToProps, { fetchEntity })(EntityLoad);

EntityLoad.propTypes = {
  id: PropTypes.string.isRequired,
  children: PropTypes.func.isRequired,
  renderWhenLoading: PropTypes.node,
};

class Entity {
  static Label = EntityLabel;
  static Link = EntityLink;
  static Load = EntityLoad;
}

export default Entity;
