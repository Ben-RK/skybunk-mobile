import React from 'react';
import PropTypes from 'prop-types';
import { Dimensions, TouchableOpacity, View, Modal } from 'react-native';
import {
  Text, Thumbnail, ListItem, Card, CardItem,
  Container, Content, Left, Icon, Button
} from 'native-base';
import _ from 'lodash';
import { Font, AppLoading } from "expo";
import date from 'date-fns';

import CreateResourceModal from '../CreateResourceModal/CreateResourceModal';
import ApiClient from '../../ApiClient';
import styles from "./CommentStyle";

export default class Comment extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      profilePicture: null,
      showEditButtons: false,
      editing: false,
    }
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });

    ApiClient.get(`/users/${this.props.data.author._id}/profilePicture`, {}).then(pic => {
      this.setState({
        profilePicture: pic,
      });
    }).catch(error => {
      console.log(error);
    });

    this.setState({ loading: false });
  }

  onPressComment = () => {
    if (!this.props.enableEditing) return;

    this.setState({ showEditButtons: true });
  }

  hideEditButtons = () => {
    this.setState({ showEditButtons: false });
  }

  onPressEdit = () => {
    this.setState({ editing: true })
    this.hideEditButtons();
  }

  saveEdited = (newContent) => {
    const { updateComment, data } = this.props;

    var commentId = data._id;
    var newComment = {
      ...data,
      content: newContent
    }

    this.closeEditingModal();

    updateComment && updateComment(commentId, newComment, "updateComment");
  }

  closeEditingModal = () => {
    this.setState({ editing: false });
  }

  onPressDelete = () => {
    const { updateComment, data } = this.props;

    var commentId = data._id;

    this.hideEditButtons();

    updateComment && updateComment(commentId, {}, "deleteComment");
  }

  render() {
    const {
      showEditButtons,
      editing
    } = this.state;

    const { data } = this.props;

    var {
      author,
      content,
      createdAt,
    } = data;

    var authorName;
    if (!author) authorName = "Ghost";
    else authorName = `${author.firstName} ${author.lastName}`;

    var authorPhoto = author.profilePicture;

    return (
      <View>
        <Card style={styles.card}>
          <CardItem style={styles.cardItem}>
            <View style={styles.textContainer}>
              <Thumbnail small style={styles.profilePicThumbnail} source={{ uri: `data:image/png;base64,${this.state.profilePicture}` }} />
              <TouchableOpacity onPress={this.onPressComment} hitSlop={{ top: 15, bottom: 15, left: 10, right: 10 }}>
                <Text style={styles.textAuthor}>
                  {`${authorName} `}
                </Text>
                <Text style={styles.textContent}>
                  {content}
                </Text>
              </TouchableOpacity>
            </View>
          </CardItem>
        </Card>

        <View>
          <Modal
            animationType="slide"
            transparent={true}
            visible={showEditButtons}
            onRequestClose={this.hideEditButtons}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={styles.editButtonsContainer}
              onPress={this.hideEditButtons}
            >
              <View style={styles.view}>
                <Button block style={styles.editButton} onPress={this.onPressEdit}>
                  <Text>Edit Comment</Text>
                </Button>
                <Button block style={styles.deleteButton} onPress={this.onPressDelete}>
                  <Text>Delete Comment</Text>
                </Button>
              </View>
            </TouchableOpacity>
          </Modal>
        </View>

        <CreateResourceModal
          onClose={this.closeEditingModal}
          isModalOpen={editing}
          saveResource={this.saveEdited}
          existing={content}
          submitButtonText='Save'
        />

      </View>
    )
  }
}